<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Stok;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PurchaseOrder::with(['supplier', 'product'])
            ->orderByDesc('tanggal_po');

        if ($request->status && $request->status !== 'semua') {
            $query->where('status', $request->status);
        }

        $hargaCriteria = \App\Models\Criteria::where('nama_kriteria', 'Harga Satuan')->first();
        
        $supplierProducts = \Illuminate\Support\Facades\DB::table('product_supplier')
            ->join('products', 'products.id', '=', 'product_supplier.product_id')
            ->leftJoin('criteria_values', function ($join) use ($hargaCriteria) {
                $join->on('criteria_values.product_id', '=', 'product_supplier.product_id')
                     ->on('criteria_values.supplier_id', '=', 'product_supplier.supplier_id');
                if ($hargaCriteria) {
                     $join->where('criteria_values.criteria_id', $hargaCriteria->id);
                }
            })
            ->select('product_supplier.supplier_id', 'products.id as product_id', 'products.nama_produk', 'criteria_values.nilai as harga_satuan')
            ->get();

        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $query->get(),
            'status'         => $request->status ?? 'semua',
            'stats'          => [
                'total'     => PurchaseOrder::count(),
                'draft'     => PurchaseOrder::draft()->count(),
                'diterima'  => PurchaseOrder::diterima()->count(),
            ],
            'suppliers'        => Supplier::orderBy('nama_supplier')->get()->map(function ($supplier) {
                $minOrderVal = DB::table('criteria_values')
                    ->join('criteria', 'criteria.id', '=', 'criteria_values.criteria_id')
                    ->where('criteria.nama_kriteria', 'Minimal Order')
                    ->where('criteria_values.supplier_id', $supplier->id)
                    ->whereNull('criteria_values.product_id')
                    ->value('criteria_values.nilai') ?? 0;

                return [
                    'id'             => $supplier->id,
                    'nama_supplier'  => $supplier->nama_supplier,
                    'potongan_tunai' => $supplier->potongan_tunai,
                    'minimal_order'  => (int) $minOrderVal,
                ];
            }),
            'products'         => Product::orderBy('nama_produk')->get(),
            'supplierProducts' => $supplierProducts,
            'nomorPo'          => PurchaseOrder::generateNomorPo(),
            'defaultSupplierId' => $request->query('supplier_id') ? (int) $request->query('supplier_id') : null,
            'defaultProductId'  => $request->query('product_id') ? (int) $request->query('product_id') : null,
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        return redirect()->route('purchase-orders.index', [
            'supplier_id' => $request->query('supplier_id'),
            'product_id'  => $request->query('product_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id'                       => ['required', 'exists:suppliers,id'],
            'product_id'                        => ['nullable', 'exists:products,id'],
            'tanggal_po'                        => ['required', 'date'],
            'keterangan'                        => ['nullable', 'string', 'max:500'],
            'items'                             => ['required', 'array', 'min:1'],
            'items.*.nama_barang'               => ['required', 'string', 'max:255'],
            'items.*.jumlah'                    => ['required', 'integer', 'min:1'],
            'items.*.harga_satuan'              => ['required', 'numeric', 'min:0'],
            'items.*.diskon_satuan'             => ['nullable', 'numeric', 'min:0'],
            'items.*.tanggal_kadaluarsa'        => ['nullable', 'date'],
        ]);

        $minOrderVal = DB::table('criteria_values')
            ->join('criteria', 'criteria.id', '=', 'criteria_values.criteria_id')
            ->where('criteria.nama_kriteria', 'Minimal Order')
            ->where('criteria_values.supplier_id', $validated['supplier_id'])
            ->whereNull('criteria_values.product_id')
            ->value('criteria_values.nilai') ?? 0;

        $totalJumlah = collect($validated['items'])->sum('jumlah');

        if ($totalJumlah < $minOrderVal) {
            return back()->withErrors([
                'items' => 'Total pemesanan (' . $totalJumlah . ' unit) kurang dari minimal order supplier ini (' . $minOrderVal . ' unit).'
            ]);
        }

        DB::transaction(function () use ($validated) {
            $total = collect($validated['items'])
                ->sum(fn ($i) => $i['jumlah'] * (($i['harga_satuan'] ?? 0) - ($i['diskon_satuan'] ?? 0)));

            $po = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'product_id'  => $validated['product_id'] ?? null,
                'nomor_po'    => PurchaseOrder::generateNomorPo(),
                'tanggal_po'  => $validated['tanggal_po'],
                'status'      => 'draft',
                'total_harga' => $total,
                'keterangan'  => $validated['keterangan'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $diskon      = (float) ($item['diskon_satuan'] ?? 0);
                $hargaBersih = (float) $item['harga_satuan'] - $diskon;

                PurchaseOrderItem::create([
                    'purchase_order_id'  => $po->id,
                    'nama_barang'        => $item['nama_barang'],
                    'jumlah'             => $item['jumlah'],
                    'harga_satuan'       => $item['harga_satuan'],
                    'diskon_satuan'      => $diskon,
                    'total_harga'        => $item['jumlah'] * $hargaBersih,
                    'tanggal_kadaluarsa' => $item['tanggal_kadaluarsa'] ?? null,
                ]);
            }
        });

        return redirect()->route('purchase-orders.index')
            ->with('success', 'Purchase Order berhasil dibuat.');
    }

    public function show(PurchaseOrder $purchaseOrder): Response
    {
        $purchaseOrder->load(['supplier', 'product', 'items']);

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function receive(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return back()->withErrors(['status' => 'PO ini sudah diproses sebelumnya.']);
        }

        DB::transaction(function () use ($purchaseOrder) {
            foreach ($purchaseOrder->items as $item) {
                $lastStok = Stok::where('nama_barang', $item->nama_barang)
                                ->whereNotNull('harga_jual')
                                ->latest('id')
                                ->first();

                $product = Product::firstOrCreate(
                    ['nama_produk' => $item->nama_barang],
                    ['kategori' => null]
                );

                $hargaBeli = (float) $item->harga_satuan - (float) $item->diskon_satuan;

                Stok::create([
                    'product_id'         => $product->id,
                    'nama_barang'        => $item->nama_barang,
                    'jumlah'             => $item->jumlah,
                    'harga_jual'         => $lastStok ? $lastStok->harga_jual : 0,
                    'harga_beli'         => $hargaBeli,
                    'tanggal_masuk'      => now()->toDateString(),
                    'tanggal_kadaluarsa' => $item->tanggal_kadaluarsa
                        ?? now()->addMonths(12)->toDateString(),
                    'keterangan'         => 'Dari PO ' . $purchaseOrder->nomor_po,
                ]);
            }

            $purchaseOrder->update([
                'status'        => 'diterima',
                'tanggal_terima' => now()->toDateString(),
            ]);
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder)
            ->with('success', 'Barang diterima! Stok otomatis bertambah.');
    }

    public function cancel(PurchaseOrder $purchaseOrder): RedirectResponse
    {
        if ($purchaseOrder->status !== 'draft') {
            return back()->withErrors(['status' => 'Hanya PO dengan status draft yang bisa dibatalkan.']);
        }

        $purchaseOrder->update(['status' => 'dibatalkan']);

        return redirect()->route('purchase-orders.index')
            ->with('success', 'Purchase Order berhasil dibatalkan.');
    }
}
