<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\SalesTransaction;
use App\Models\Stok;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $dari  = $request->dari  ?? now()->startOfMonth()->toDateString();
        $sampai = $request->sampai ?? now()->toDateString();

        $poMasuk = PurchaseOrder::with(['supplier', 'items'])
            ->where('status', 'diterima')
            ->whereBetween('tanggal_terima', [$dari, $sampai])
            ->orderByDesc('tanggal_terima')
            ->get()
            ->map(fn ($po) => [
                'id'           => $po->id,
                'nomor_po'     => $po->nomor_po,
                'supplier'     => $po->supplier?->nama_supplier,
                'tanggal'      => $po->tanggal_terima,
                'total_harga'  => (float) $po->total_harga,
                'items_count'  => $po->items->count(),
                'total_item_qty' => $po->items->sum('jumlah'),
            ]);


        $penjualan = SalesTransaction::with(['customer', 'items'])
            ->whereBetween('tanggal_jual', [$dari, $sampai])
            ->orderByDesc('tanggal_jual')
            ->get()
            ->map(fn ($s) => [
                'id'               => $s->id,
                'nomor_nota'       => $s->nomor_nota,
                'customer'         => $s->customer?->nama_customer,
                'tanggal'          => $s->tanggal_jual,
                'jenis_pembayaran' => $s->jenis_pembayaran,
                'total_harga'      => (float) $s->total_harga,
                'items_count'      => $s->items->count(),
                'total_item_qty'   => $s->items->sum('jumlah'),
            ]);

        $totalMasuk    = $poMasuk->sum('total_harga');
        $totalKeluar   = $penjualan->sum('total_harga');
        $omzetTunai    = $penjualan->where('jenis_pembayaran', 'tunai')->sum('total_harga');
        $omzetKredit   = $penjualan->where('jenis_pembayaran', 'kredit')->sum('total_harga');

        return Inertia::render('Laporan/Index', [
            'dari'         => $dari,
            'sampai'       => $sampai,
            'poMasuk'      => $poMasuk,
            'penjualan'    => $penjualan,
            'summary' => [
                'total_po_masuk'   => $poMasuk->count(),
                'total_penjualan'  => $penjualan->count(),
                'nilai_masuk'      => $totalMasuk,
                'nilai_keluar'     => $totalKeluar,
                'omzet_tunai'      => $omzetTunai,
                'omzet_kredit'     => $omzetKredit,
                'laba_kotor'       => $totalKeluar - $totalMasuk,
            ],
        ]);
    }
}
