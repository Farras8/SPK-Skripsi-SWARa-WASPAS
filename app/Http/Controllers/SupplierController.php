<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\CriteriaValue;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        $suppliers = Supplier::orderBy('nama_supplier')->get();
        $supplierCriteria = Criteria::where('kategori', 'supplier')
            ->orderBy('urutan_prioritas')
            ->get();
        $supplierIds = $suppliers->pluck('id');
        $criteriaValues = CriteriaValue::whereIn('supplier_id', $supplierIds)
            ->whereNull('product_id')
            ->with('criteria')
            ->get()
            ->groupBy('supplier_id');

        $supplierData = $suppliers->map(function ($supplier) use ($criteriaValues, $supplierCriteria) {
            $values = $criteriaValues->get($supplier->id, collect())->keyBy('criteria_id');

            $data = [
                'id'             => $supplier->id,
                'nama_supplier'  => $supplier->nama_supplier,
                'potongan_tunai' => $supplier->potongan_tunai,
            ];
            foreach ($supplierCriteria as $criteria) {
                $data['criteria_' . $criteria->id] = $values->get($criteria->id)?->nilai;
            }

            return $data;
        });

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $supplierData,
            'criteria' => $supplierCriteria->map(fn($c) => [
                'id' => $c->id,
                'nama_kriteria' => $c->nama_kriteria,
                'tipe' => $c->tipe->value,
                'options' => $c->options,
                'satuan' => $c->satuan,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Suppliers/Create');
    }

    public function store(Request $request): RedirectResponse
    {

        $supplierCriteria = Criteria::where('kategori', 'supplier')->get();

        $validationRules = [
            'nama_supplier'  => ['required', 'string', 'max:255'],
            'potongan_tunai' => ['nullable', 'string', 'max:100'],
        ];
        
        foreach ($supplierCriteria as $criteria) {
            $validationRules['criteria_' . $criteria->id] = ['nullable', 'numeric'];
        }
        
        $validated = $request->validate($validationRules);

        $supplier = Supplier::create([
            'nama_supplier'  => $validated['nama_supplier'],
            'potongan_tunai' => $validated['potongan_tunai'] ?? null,
        ]);

        $this->updateSupplierCriteriaValues($supplier, $validated, $supplierCriteria);

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function edit(Supplier $supplier): Response
    {
        $criteriaValues = CriteriaValue::where('supplier_id', $supplier->id)
            ->whereNull('product_id')
            ->with('criteria')
            ->get();

        $valuesByCriteria = [];
        foreach ($criteriaValues as $cv) {
            if ($cv->criteria) {
                $valuesByCriteria[$cv->criteria->nama_kriteria] = $cv->nilai;
            }
        }

        $supplierData = array_merge($supplier->toArray(), [
            'jam_kirim'      => $valuesByCriteria['Kecepatan Pengiriman'] ?? null,
            'pelayanan'      => $valuesByCriteria['Pelayanan'] ?? $valuesByCriteria['Layanan Retur'] ?? null,
            'skor_min_order' => $valuesByCriteria['Minimal Order'] ?? null,
        ]);

        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplierData,
        ]);
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $supplierCriteria = Criteria::where('kategori', 'supplier')->get();
        
        $validationRules = [
            'nama_supplier'  => ['required', 'string', 'max:255'],
            'potongan_tunai' => ['nullable', 'string', 'max:100'],
        ];
        
        foreach ($supplierCriteria as $criteria) {
            $validationRules['criteria_' . $criteria->id] = ['nullable', 'numeric'];
        }
        
        $validated = $request->validate($validationRules);

        $supplier->update([
            'nama_supplier'  => $validated['nama_supplier'],
            'potongan_tunai' => $validated['potongan_tunai'] ?? null,
        ]);

        $this->updateSupplierCriteriaValues($supplier, $validated, $supplierCriteria);

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil dihapus.');
    }

    private function updateSupplierCriteriaValues(Supplier $supplier, array $validated, $supplierCriteria): void
    {
        $toUpsert = [];
        $toDeleteIds = [];

        foreach ($supplierCriteria as $criteria) {
            $fieldName = 'criteria_' . $criteria->id;
            if (isset($validated[$fieldName]) && $validated[$fieldName] !== null && $validated[$fieldName] !== '') {
                $toUpsert[] = [
                    'criteria_id' => $criteria->id,
                    'supplier_id' => $supplier->id,
                    'product_id'  => null,
                    'nilai'       => $validated[$fieldName],
                ];
            } else {
                $toDeleteIds[] = $criteria->id;
            }
        }

        if ($toUpsert) {
            CriteriaValue::upsert(
                $toUpsert,
                ['criteria_id', 'supplier_id', 'product_id'],
                ['nilai']
            );
        }

        if ($toDeleteIds) {
            CriteriaValue::whereIn('criteria_id', $toDeleteIds)
                ->where('supplier_id', $supplier->id)
                ->whereNull('product_id')
                ->delete();
        }
    }
}
