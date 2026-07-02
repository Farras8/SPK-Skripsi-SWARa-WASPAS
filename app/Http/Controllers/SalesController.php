<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Hutang;
use App\Models\Product;
use App\Models\SalesItem;
use App\Models\SalesTransaction;
use App\Models\Stok;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    private function getAvailableProducts(): \Illuminate\Support\Collection
    {
        return Stok::select('stoks.*')
            ->join('products', 'stoks.product_id', '=', 'products.id')
            ->where('stoks.jumlah', '>', 0)
            ->where('stoks.tanggal_kadaluarsa', '>=', now()->toDateString())
            ->orderBy('products.nama_produk', 'asc')
            ->orderBy('stoks.tanggal_kadaluarsa', 'asc')
            ->with('product')
            ->get()
            ->map(fn ($s) => [
                'id'                 => $s->id,
                'product_id'         => $s->product_id,
                'nama_produk'        => $s->product->nama_produk,
                'kategori'           => $s->product->kategori,
                'stok'               => $s->jumlah,
                'harga_jual'         => (float) $s->harga_jual,
                'tanggal_kadaluarsa' => $s->tanggal_kadaluarsa->format('Y-m-d'),
                'keterangan'         => $s->keterangan,
            ]);
    }

    public function index(Request $request): Response
    {
        $query = SalesTransaction::with(['customer', 'items'])
            ->orderByDesc('tanggal_jual');

        if ($request->filter && $request->filter !== 'semua') {
            $query->where('jenis_pembayaran', $request->filter);
        }

        $sales = $query->get()->map(fn ($s) => array_merge($s->toArray(), [
            'items_count' => $s->items->count(),
        ]));

        $customers = Customer::where('is_blacklisted', false)
            ->orderBy('nama_customer')
            ->get();

        return Inertia::render('Sales/Index', [
            'sales'  => $sales,
            'filter' => $request->filter ?? 'semua',
            'stats'  => [
                'total'        => SalesTransaction::count(),
                'total_tunai'  => SalesTransaction::tunai()->count(),
                'total_kredit' => SalesTransaction::kredit()->count(),
                'omzet_hari_ini' => (float) SalesTransaction::whereDate('tanggal_jual', today())->sum('total_harga'),
            ],
            'products'    => $this->getAvailableProducts(),
            'customers'   => $customers,
            'nomorNota'   => SalesTransaction::generateNomorNota(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Sales/Create', [
            'products'    => $this->getAvailableProducts(),
            'customers'   => Customer::where('is_blacklisted', false)->orderBy('nama_customer')->get(),
            'nomorNota'   => SalesTransaction::generateNomorNota(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id'          => ['nullable', 'exists:customers,id'],
            'tanggal_jual'         => ['required', 'date'],
            'jenis_pembayaran'     => ['required', 'in:tunai,kredit'],
            'keterangan'           => ['nullable', 'string', 'max:500'],
            'items'                => ['required', 'array', 'min:1'],
            'items.*.stok_id'      => ['required', 'exists:stoks,id'],
            'items.*.jumlah'       => ['required', 'integer', 'min:1'],
            'items.*.harga_satuan' => ['required', 'numeric', 'min:0'],
        ]);

        foreach ($validated['items'] as $item) {
            $stok = Stok::with('product')->find($item['stok_id']);
            if ($stok->jumlah < $item['jumlah']) {
                return back()->withErrors([
                    'items' => "Stok '{$stok->product->nama_produk}' tidak mencukupi. Tersedia: {$stok->jumlah}.",
                ]);
            }
        }

        if ($validated['jenis_pembayaran'] === 'kredit') {
            if (empty($validated['customer_id'])) {
                return back()->withErrors(['customer_id' => 'Customer wajib dipilih untuk pembayaran kredit.']);
            }

            $customer = Customer::find($validated['customer_id']);

            if ($customer->is_blacklisted) {
                return back()->withErrors(['customer_id' => 'Customer ini sedang di-blacklist.']);
            }

            $total = collect($validated['items'])->sum(fn ($i) => $i['jumlah'] * $i['harga_satuan']);
            if ($total > $customer->sisa_plafon) {
                return back()->withErrors([
                    'customer_id' => "Total penjualan melebihi sisa plafon customer (Rp " . number_format($customer->sisa_plafon, 0, ',', '.') . ")."
                ]);
            }
        }

        DB::transaction(function () use ($validated) {
            $total = collect($validated['items'])
                ->sum(fn ($i) => $i['jumlah'] * $i['harga_satuan']);

            $sale = SalesTransaction::create([
                'customer_id'      => $validated['customer_id'] ?? null,
                'nomor_nota'       => SalesTransaction::generateNomorNota(),
                'tanggal_jual'     => $validated['tanggal_jual'],
                'jenis_pembayaran' => $validated['jenis_pembayaran'],
                'total_harga'      => $total,
                'keterangan'       => $validated['keterangan'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $stok = Stok::with('product')->find($item['stok_id']);
                $stok->decrement('jumlah', $item['jumlah']);

                SalesItem::create([
                    'sales_transaction_id' => $sale->id,
                    'stok_id'              => $stok->id,
                    'nama_barang'          => $stok->product->nama_produk,
                    'jumlah'               => $item['jumlah'],
                    'harga_satuan'         => $item['harga_satuan'],
                    'total_harga'          => $item['jumlah'] * $item['harga_satuan'],
                ]);
            }

            if ($validated['jenis_pembayaran'] === 'kredit' && !empty($validated['customer_id'])) {
                Hutang::create([
                    'customer_id'   => $validated['customer_id'],
                    'jumlah_hutang' => $total,
                    'tanggal_hutang' => $validated['tanggal_jual'],
                    'keterangan'    => 'Nota: ' . $sale->nomor_nota,
                    'status'        => 'belum_lunas',
                ]);
            }
        });

        return redirect()->route('sales.index')
            ->with('success', 'Transaksi penjualan berhasil dicatat.');
    }

    public function show(SalesTransaction $sale): Response
    {
        $sale->load(['customer', 'items.stok']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function destroy(SalesTransaction $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                if ($item->stok_id) {
                    Stok::where('id', $item->stok_id)->increment('jumlah', $item->jumlah);
                }
            }
            $sale->delete();
        });

        return redirect()->route('sales.index')
            ->with('success', 'Transaksi berhasil dihapus. Stok dikembalikan.');
    }
}
