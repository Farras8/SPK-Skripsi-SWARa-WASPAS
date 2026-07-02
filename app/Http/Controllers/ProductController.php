<?php

namespace App\Http\Controllers;

use App\Models\Criteria;
use App\Models\CriteriaValue;
use App\Models\Product;
use App\Models\ProductSupplier;
use App\Models\Stok;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Products/Index', [
            'products' => Product::orderBy('kategori')->orderBy('nama_produk')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Products/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'kategori' => ['nullable', 'string', 'max:255'],
        ]);

        $product = Product::create($validated);

        Stok::create([
            'product_id'         => $product->id,
            'nama_barang'        => $product->nama_produk,
            'jumlah'             => 0,
            'harga_jual'         => 0,
            'tanggal_masuk'      => today(),
            'tanggal_kadaluarsa' => today()->addYears(1),
        ]);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Products/Edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255'],
            'kategori' => ['nullable', 'string', 'max:255'],
        ]);

        $oldNama = $product->nama_produk;
        $product->update($validated);
        if ($oldNama !== $validated['nama_produk']) {
            Stok::where('product_id', $product->id)->update(['nama_barang' => $validated['nama_produk']]);
        }

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $stokAktif = $product->stoks()->where('jumlah', '>', 0)->sum('jumlah');

        if ($stokAktif > 0) {
            return redirect()->route('products.index')
                ->with('error', "Produk '{$product->nama_produk}' tidak dapat dihapus karena masih memiliki stok sebanyak {$stokAktif} unit.");
        }
        $product->stoks()->delete();
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus.');
    }

    public function manageSuppliers(Product $product): Response
    {
        $suppliers = Supplier::orderBy('nama_supplier')->get();

        $productCriteria = Criteria::where('kategori', 'product')
            ->orderBy('urutan_prioritas')
            ->get();

        $existingSupplierIds = ProductSupplier::where('product_id', $product->id)
            ->pluck('supplier_id')
            ->flip();

        $criteriaValues = CriteriaValue::where('product_id', $product->id)
            ->get()
            ->groupBy('supplier_id');

        $supplierData = $suppliers->map(function ($supplier) use ($existingSupplierIds, $criteriaValues, $productCriteria) {
            $values = $criteriaValues->get($supplier->id, collect())->keyBy('criteria_id');

            $data = [
                'supplier_id' => $supplier->id,
                'nama_supplier' => $supplier->nama_supplier,
                'tersedia' => isset($existingSupplierIds[$supplier->id]),
            ];
            foreach ($productCriteria as $criteria) {
                $nilai = $values->get($criteria->id)?->nilai;
                $data['criteria_' . $criteria->id] = $nilai ? (float) $nilai : null;
            }

            return $data;
        });

        return Inertia::render('Products/ManageSuppliers', [
            'product' => $product,
            'supplierData' => $supplierData,
            'criteria' => $productCriteria->map(fn($c) => [
                'id' => $c->id,
                'nama_kriteria' => $c->nama_kriteria,
                'tipe' => $c->tipe->value,
                'options' => $c->options,
            ]),
        ]);
    }

    public function saveSuppliers(Request $request, Product $product): RedirectResponse
    {

        $productCriteria = Criteria::where('kategori', 'product')->get();

        $validationRules = [
            'suppliers' => ['required', 'array'],
            'suppliers.*.supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'suppliers.*.tersedia' => ['required', 'boolean'],
        ];
        
        foreach ($productCriteria as $criteria) {
            $field = 'suppliers.*.criteria_' . $criteria->id;
            $validationRules[$field] = ['nullable', 'numeric'];
        }
        
        $validated = $request->validate($validationRules);

        $activeSupplierIds = [];
        $inactiveSupplierIds = [];
        $criteriaValuesToUpsert = [];
        $criteriaValuesToDelete = [];

        foreach ($validated['suppliers'] as $item) {
            $supplierId = $item['supplier_id'];
            if ($item['tersedia']) {
                $activeSupplierIds[] = $supplierId;
                foreach ($productCriteria as $criteria) {
                    $fieldName = 'criteria_' . $criteria->id;
                    if (isset($item[$fieldName]) && $item[$fieldName] !== null && $item[$fieldName] !== '') {
                        $criteriaValuesToUpsert[] = [
                            'criteria_id' => $criteria->id,
                            'supplier_id' => $supplierId,
                            'product_id'  => $product->id,
                            'nilai'       => $item[$fieldName],
                        ];
                    } else {
                        $criteriaValuesToDelete[] = [$criteria->id, $supplierId];
                    }
                }
            } else {
                $inactiveSupplierIds[] = $supplierId;
            }
        }

        foreach ($activeSupplierIds as $supplierId) {
            ProductSupplier::firstOrCreate([
                'product_id'  => $product->id,
                'supplier_id' => $supplierId,
            ]);
        }

        if ($criteriaValuesToUpsert) {
            CriteriaValue::upsert(
                $criteriaValuesToUpsert,
                ['criteria_id', 'supplier_id', 'product_id'],
                ['nilai']
            );
        }

        foreach ($criteriaValuesToDelete as [$criteriaId, $supplierId]) {
            CriteriaValue::where('criteria_id', $criteriaId)
                ->where('supplier_id', $supplierId)
                ->where('product_id', $product->id)
                ->delete();
        }

        if ($inactiveSupplierIds) {
            ProductSupplier::where('product_id', $product->id)
                ->whereIn('supplier_id', $inactiveSupplierIds)
                ->delete();
            CriteriaValue::where('product_id', $product->id)
                ->whereIn('supplier_id', $inactiveSupplierIds)
                ->delete();
        }

        return redirect()->route('products.manage-suppliers', $product)
            ->with('success', 'Data supplier untuk produk ini berhasil disimpan.');
    }
}
