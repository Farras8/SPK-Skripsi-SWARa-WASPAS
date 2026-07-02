<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stok;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StokController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->tab ?? 'semua';

        $query = Stok::query();

        if ($tab === 'fifo') {
            $query->where('jumlah', '>', 0)->fifoOrder();
        } elseif ($tab === 'expired') {
            $query->sudahKadaluarsa();
        } elseif ($tab === 'warning') {
            $query->hampirKadaluarsa(30);
        } else {
            $query->orderByDesc('tanggal_masuk');
        }

        return Inertia::render('Stoks/Index', [
            'stoks'    => $query->with('product:id,nama_produk')->get(),
            'products' => Product::orderBy('nama_produk')->get(['id', 'nama_produk', 'kategori']),
            'tab' => $tab,
            'stats' => [
                'total'            => Stok::count(),
                'hampir_kadaluarsa' => Stok::hampirKadaluarsa(30)->count(),
                'sudah_kadaluarsa' => Stok::sudahKadaluarsa()->count(),
                'stok_menipis'     => Stok::selectRaw('nama_barang, SUM(jumlah) as total_jumlah')
                                        ->groupBy('nama_barang')
                                        ->havingRaw('SUM(jumlah) > 0')
                                        ->havingRaw('SUM(jumlah) < 10')
                                        ->get()
                                        ->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Stoks/Create', [
            'products' => Product::orderBy('nama_produk')->get(['id', 'nama_produk', 'kategori']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id'         => ['nullable', 'exists:products,id'],
            'nama_barang'        => ['required', 'string', 'max:255'],
            'jumlah'             => ['required', 'integer', 'min:1'],
            'harga_jual'         => ['required', 'numeric', 'min:0'],
            'harga_beli'         => ['nullable', 'numeric', 'min:0'],
            'tanggal_masuk'      => ['required', 'date'],
            'tanggal_kadaluarsa' => ['required', 'date', 'after:tanggal_masuk'],
            'keterangan'         => ['nullable', 'string', 'max:500'],
        ]);
        if (empty($validated['product_id'])) {
            $product = Product::firstOrCreate(
                ['nama_produk' => $validated['nama_barang']],
                ['kategori' => null]
            );
            $validated['product_id'] = $product->id;
        } else {
            $product = Product::find($validated['product_id']);
            $validated['nama_barang'] = $product->nama_produk;
        }

        Stok::create($validated);

        return redirect()->route('stoks.index')->with('success', 'Stok berhasil ditambahkan.');
    }

    public function edit(Stok $stok): Response
    {
        return Inertia::render('Stoks/Edit', [
            'stok' => $stok,
        ]);
    }

    public function update(Request $request, Stok $stok): RedirectResponse
    {
        $validated = $request->validate([
            'nama_barang' => ['required', 'string', 'max:255'],
            'jumlah' => ['required', 'integer', 'min:0'],
            'harga_jual' => ['required', 'numeric', 'min:0'],
            'harga_beli' => ['nullable', 'numeric', 'min:0'],
            'tanggal_masuk' => ['required', 'date'],
            'tanggal_kadaluarsa' => ['required', 'date', 'after:tanggal_masuk'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ]);

        $stok->update($validated);

        return redirect()->route('stoks.index')->with('success', 'Stok berhasil diperbarui.');
    }

    public function destroy(Stok $stok): RedirectResponse
    {
        $stok->delete();

        return redirect()->route('stoks.index')->with('success', 'Stok berhasil dihapus.');
    }

    public function adjust(Request $request, Stok $stok): RedirectResponse
    {
        $validated = $request->validate([
            'selisih'     => ['required', 'integer', 'not_in:0'],
            'keterangan'  => ['required', 'string', 'max:255'],
        ]);

        $jumlahBaru = $stok->jumlah + $validated['selisih'];

        if ($jumlahBaru < 0) {
            return back()->withErrors(['selisih' => 'Jumlah stok tidak boleh negatif (stok saat ini: ' . $stok->jumlah . ').']);
        }

        $stok->update([
            'jumlah'      => $jumlahBaru,
            'keterangan'  => '[Opname] ' . $validated['keterangan'],
        ]);

        $selisih = $validated['selisih'];
        $sign = $selisih > 0 ? '+' : '';

        return redirect()->route('stoks.index')->with('success',
            "Stok {$stok->nama_barang} diubah: {$stok->getOriginal('jumlah')} → {$jumlahBaru} ({$sign}{$selisih})."
        );
    }
}
