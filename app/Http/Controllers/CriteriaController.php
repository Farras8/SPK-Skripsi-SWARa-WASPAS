<?php

namespace App\Http\Controllers;

use App\Enums\CriteriaType;
use App\Models\Criteria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CriteriaController extends Controller
{
    private const VALID_SJ_VALUES = [0.0, 0.25, 0.5, 0.75, 1.0];

    public function index(): Response
    {
        return Inertia::render('Criteria/Index', [
            'criteria' => Criteria::orderBy('urutan_prioritas')->get(),
            'tipeOptions' => collect(CriteriaType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kriteria' => ['required', 'string', 'max:255'],
            'kategori'      => ['required', 'string', 'in:product,supplier'],
            'tipe'          => ['required', 'string', 'in:cost,benefit'],
            'options'       => ['nullable', 'array'],
            'satuan'        => ['nullable', 'string', 'max:50'],
        ]);

        if ($validated['tipe'] === 'cost') {
            $validated['options'] = null;
        }

        $maxOrder = Criteria::max('urutan_prioritas') ?? 0;

        Criteria::create(array_merge($validated, [
            'urutan_prioritas' => $maxOrder + 1,
        ]));

        return redirect()->route('criteria.index')->with('success', 'Kriteria berhasil ditambahkan.');
    }

    public function update(Request $request, Criteria $criterion): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kriteria' => ['required', 'string', 'max:255'],
            'kategori'      => ['required', 'string', 'in:product,supplier'],
            'tipe'          => ['required', 'string', 'in:cost,benefit'],
            'options'       => ['nullable', 'array'],
            'satuan'        => ['nullable', 'string', 'max:50'],
        ]);

        if ($validated['tipe'] === 'cost') {
            $validated['options'] = null;
        }

        $criterion->update($validated);

        return redirect()->route('criteria.index')->with('success', 'Kriteria berhasil diperbarui.');
    }

    public function destroy(Criteria $criterion): RedirectResponse
    {
        $deletedOrder = $criterion->urutan_prioritas;
        $criterion->delete();

        Criteria::where('urutan_prioritas', '>', $deletedOrder)
            ->decrement('urutan_prioritas');

        return redirect()->route('criteria.index')->with('success', 'Kriteria berhasil dihapus.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['required', 'integer', 'exists:criteria,id'],
        ]);

        foreach ($validated['order'] as $index => $id) {
            Criteria::where('id', $id)->update(['urutan_prioritas' => $index + 1]);
        }

        return redirect()->route('criteria.index')->with('success', 'Urutan kriteria berhasil diperbarui.');
    }

    public function saveWeights(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'weights' => ['required', 'array'],
            'weights.*.id' => ['required', 'integer', 'exists:criteria,id'],
            'weights.*.nilai_sj' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $criteriaMap = Criteria::whereIn('id', collect($validated['weights'])->pluck('id'))
            ->get()
            ->keyBy('id');

        $criteria = collect($validated['weights'])->sortBy(fn ($w) =>
            $criteriaMap->get($w['id'])?->urutan_prioritas ?? 0
        )->values();

        Log::channel('spk_calculation')->info('SWARA_START', [
            'criteria_count' => $criteria->count(),
            'input' => $criteria->map(fn ($item) => [
                'id' => $item['id'],
                'nama_kriteria' => $criteriaMap->get($item['id'])?->nama_kriteria,
                'urutan_prioritas' => $criteriaMap->get($item['id'])?->urutan_prioritas,
                'nilai_sj_input' => $item['nilai_sj'] ?? null,
                'nilai_sj_normalized' => ($item['nilai_sj'] ?? null) === null ? null : $this->normalizeSjValue((float) $item['nilai_sj']),
            ])->all(),
        ]);

        $results = $this->calculateSwara($criteria);

        Log::channel('spk_calculation')->info('SWARA_RESULT', [
            'results' => collect($results)->map(fn ($result) => [
                'id' => $result['id'],
                'nama_kriteria' => $criteriaMap->get($result['id'])?->nama_kriteria,
                'urutan_prioritas' => $criteriaMap->get($result['id'])?->urutan_prioritas,
                'nilai_sj' => $result['nilai_sj'],
                'kj' => $result['kj'],
                'qj' => $result['qj'],
                'bobot_wj_raw' => $result['bobot_wj'],
                'bobot_wj_6dp' => round($result['bobot_wj'], 6),
                'bobot_wj_pct_4dp' => round($result['bobot_wj'] * 100, 4),
            ])->all(),
        ]);

        foreach ($results as $result) {
            Criteria::where('id', $result['id'])->update([
                'nilai_sj' => $result['nilai_sj'],
                'bobot_swara' => $result['bobot_wj'],
            ]);
        }

        return redirect()->route('criteria.index')->with('success', 'Bobot SWARA berhasil disimpan.');
    }

    private function calculateSwara(mixed $criteria): array
    {
        $results = [];
        $prevQ = null;
        $totalQ = 0;

        foreach ($criteria as $index => $item) {
            $sj = $index === 0 ? 0 : $this->normalizeSjValue((float) ($item['nilai_sj'] ?? 0));
            $kj = 1 + $sj;
            $qj = $index === 0 ? 1 : $prevQ / $kj;

            $results[] = [
                'id' => $item['id'],
                'nilai_sj' => $index === 0 ? null : $sj,
                'kj' => $kj,
                'qj' => $qj,
            ];

            $prevQ = $qj;
            $totalQ += $qj;
        }

        foreach ($results as &$result) {
            $result['bobot_wj'] = $totalQ > 0 ? $result['qj'] / $totalQ : 0;
        }

        return $results;
    }

    private function normalizeSjValue(float $value): float
    {
        $closest = self::VALID_SJ_VALUES[0];

        foreach (self::VALID_SJ_VALUES as $candidate) {
            if (abs($candidate - $value) < abs($closest - $value)) {
                $closest = $candidate;
            }
        }

        return $closest;
    }
}
