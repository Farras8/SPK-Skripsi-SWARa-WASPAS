<?php

namespace App\Services;

use App\Models\Criteria;
use App\Models\CriteriaValue;
use App\Models\Product;
use App\Models\ProductSupplier;
use Illuminate\Support\Facades\Log;

class WaspasService
{
    private const LAMBDA = 0.5;

    /**
     * Mapping nama kriteria ke key yang dipakai frontend ranking table.
     */
    private const DETAIL_KEY_ALIASES = [
        'Harga Satuan' => 'harga_satuan',
        'Kecepatan Pengiriman' => 'jam_kirim',
        'Pelayanan' => 'pelayanan',
    ];

    public function calculate(Product $product): array
    {
        $criteria = Criteria::orderBy('urutan_prioritas')->get();

        $activeCriteria = $criteria->filter(fn ($c) => $c->bobot_swara > 0);

        Log::channel('spk_calculation')->info('WASPAS_START', [
            'product_id' => $product->id,
            'product_name' => $product->nama_produk,
            'lambda' => self::LAMBDA,
            'active_criteria' => $activeCriteria->map(fn ($c) => [
                'id' => $c->id,
                'nama_kriteria' => $c->nama_kriteria,
                'tipe' => $c->tipe->value,
                'bobot_swara' => (float) $c->bobot_swara,
            ])->values()->all(),
        ]);

        if ($activeCriteria->isEmpty()) {
            return ['rankings' => [], 'criteria' => $criteria, 'error' => 'Bobot SWARA belum diatur.', 'calculationDetails' => null];
        }

        $productSuppliers = ProductSupplier::with('supplier')
            ->where('product_id', $product->id)
            ->get();

        if ($productSuppliers->isEmpty()) {
            return ['rankings' => [], 'criteria' => $criteria, 'error' => 'Tidak ada supplier yang tersedia untuk produk ini.', 'calculationDetails' => null];
        }

        $supplierIds = $productSuppliers->pluck('supplier_id');
        $criteriaValues = CriteriaValue::whereIn('supplier_id', $supplierIds)
            ->whereIn('criteria_id', $activeCriteria->pluck('id'))
            ->where(function ($query) use ($product) {
                $query->where('product_id', $product->id)
                    ->orWhereNull('product_id');
            })
            ->get()
            ->groupBy('supplier_id');

        $matrix = $this->buildDecisionMatrix($productSuppliers, $criteriaValues, $activeCriteria);
        $normalizeResult = $this->normalize($matrix, $activeCriteria);
        $normalized = $normalizeResult['normalized'];
        $minMax = $normalizeResult['minMax'];
        
        $result = $this->calculateWaspas($normalized, $activeCriteria, $productSuppliers, $criteriaValues);
        
        $rankings = $result['rankings'];
        $calculationDetails = $result['details'];

        Log::channel('spk_calculation')->info('WASPAS_MATRIX_NORMALIZED', [
            'product_id' => $product->id,
            'matrix' => $matrix,
            'normalized' => $normalized,
        ]);

        usort($rankings, fn ($a, $b) => $b['qi'] <=> $a['qi']);

        foreach ($rankings as $i => &$rank) {
            $rank['ranking'] = $i + 1;
            $rank['status'] = $i === 0 ? 'Rekomendasi Utama' : 'Alternatif';
        }

        return [
            'rankings' => $rankings,
            'criteria' => $criteria,
            'error' => null,
            'calculationDetails' => [
                'matrix' => $matrix,
                'normalized' => $normalized,
                'minMax' => $minMax,
                'details' => $calculationDetails,
                'lambda' => self::LAMBDA,
            ],
        ];
    }

    private function buildDecisionMatrix($productSuppliers, $criteriaValues, $criteria): array
    {
        $matrix = [];

        foreach ($productSuppliers as $ps) {
            $row = [];
            $supplierValues = $criteriaValues->get($ps->supplier_id, collect());

            foreach ($criteria as $c) {
                $criteriaValue = $supplierValues->firstWhere('criteria_id', $c->id);
                $value = $criteriaValue ? (float) $criteriaValue->nilai : 0;
                $row[$c->id] = $value;
            }

            $matrix[$ps->supplier_id] = $row;
        }

        return $matrix;
    }

    private function normalize(array $matrix, $criteria): array
    {
        $minMax = [];
        foreach ($criteria as $c) {
            $values = array_filter(array_column($matrix, $c->id), fn ($v) => $v > 0);
            if (empty($values)) {
                continue;
            }
            $minMax[$c->id] = ['min' => min($values), 'max' => max($values)];
        }

        $normalized = [];
        foreach ($matrix as $supplierId => $row) {
            foreach ($criteria as $c) {
                $value = $row[$c->id] ?? 0;
                $mm = $minMax[$c->id] ?? null;

                if (!$mm || $value == 0 || $mm['max'] == 0) {
                    $normalized[$supplierId][$c->id] = 0;
                    continue;
                }

                $normalized[$supplierId][$c->id] = $c->tipe->value === 'cost'
                    ? $mm['min'] / $value
                    : $value / $mm['max'];
            }
        }

        return [
            'normalized' => $normalized,
            'minMax' => $minMax,
        ];
    }

    private function calculateWaspas(array $normalized, $criteria, $productSuppliers, $criteriaValues): array
    {
        $rankings = [];
        $detailedCalculations = [];

        foreach ($productSuppliers as $ps) {
            $supplierId = $ps->supplier_id;
            $row = $normalized[$supplierId] ?? [];
            $supplierValues = $criteriaValues->get($supplierId, collect());

            $wsm = 0;
            $wpm = 1;
            $hasValues = false;
            $criterionBreakdown = [];

            foreach ($criteria as $c) {
                $nValue = $row[$c->id] ?? 0;
                $weight = (float) $c->bobot_swara;
                $wsmComponent = 0;
                $wpmComponent = null;

                if ($nValue > 0 && $weight > 0) {
                    $hasValues = true;
                    $wsmComponent = $nValue * $weight;
                    $wpmComponent = pow($nValue, $weight);
                    $wsm += $wsmComponent;
                    $wpm *= $wpmComponent;
                }

                $criterionBreakdown[] = [
                    'criteria_id' => $c->id,
                    'nama_kriteria' => $c->nama_kriteria,
                    'tipe' => $c->tipe->value,
                    'weight' => $weight,
                    'normalized_value' => $nValue,
                    'wsm_component' => $wsmComponent,
                    'wpm_component' => $wpmComponent,
                ];
            }

            if (!$hasValues) {
                continue;
            }

            $qiRaw = (self::LAMBDA * $wsm) + ((1 - self::LAMBDA) * $wpm);
            $qiRounded = round($qiRaw, 4);

            Log::channel('spk_calculation')->info('WASPAS_SUPPLIER_RESULT', [
                'supplier_id' => $supplierId,
                'supplier_name' => $ps->supplier->nama_supplier,
                'criterion_breakdown' => $criterionBreakdown,
                'wsm' => $wsm,
                'wpm' => $wpm,
                'qi_raw' => $qiRaw,
                'qi_rounded_4dp' => $qiRounded,
                'rounding_gap' => $qiRaw - $qiRounded,
            ]);
            $detailedCalculations[$supplierId] = [
                'supplier_id' => $supplierId,
                'nama_supplier' => $ps->supplier->nama_supplier,
                'wsm' => $wsm,
                'wpm' => $wpm,
                'qi_raw' => $qiRaw,
                'qi' => $qiRounded,
                'criterion_breakdown' => $criterionBreakdown,
            ];
            $details = [];
            foreach ($supplierValues as $cv) {
                $criteriaName = $criteria->firstWhere('id', $cv->criteria_id)?->nama_kriteria;
                if ($criteriaName) {
                    $details[$criteriaName] = $cv->nilai;
                    $aliasKey = self::DETAIL_KEY_ALIASES[$criteriaName] ?? null;
                    if ($aliasKey) {
                        $details[$aliasKey] = $cv->nilai;
                    }
                }
            }

            $rankings[] = array_merge([
                'supplier_id' => $supplierId,
                'nama_supplier' => $ps->supplier->nama_supplier,
                'qi' => $qiRounded,
                'qi_raw' => $qiRaw,
            ], $details);
        }

        return [
            'rankings' => $rankings,
            'details' => array_values($detailedCalculations),
        ];
    }
}
