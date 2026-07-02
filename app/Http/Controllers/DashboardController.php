<?php

namespace App\Http\Controllers;

use App\Models\Hutang;
use App\Models\PurchaseOrder;
use App\Models\SalesTransaction;
use App\Models\Stok;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $hampirKadaluarsa = Stok::hampirKadaluarsa(30)->fifoOrder()->limit(5)->get();
        $sudahKadaluarsa = Stok::sudahKadaluarsa()->count();

        $totalPiutang = Hutang::belumLunas()->sum('jumlah_hutang');
        $customerBermasalah = Hutang::belumLunas()
            ->with('customer')
            ->get()
            ->filter(fn ($h) => $h->status_aging === 'merah')
            ->unique('customer_id')
            ->count();

        $poDraft = PurchaseOrder::draft()->count();
        $omzetHariIni = SalesTransaction::whereDate('tanggal_jual', today())->sum('total_harga');
        $penjualanHariIni = SalesTransaction::whereDate('tanggal_jual', today())->count();

        $stokMenipisQuery = Stok::selectRaw('nama_barang, SUM(jumlah) as total_jumlah')
            ->groupBy('nama_barang')
            ->havingRaw('SUM(jumlah) > 0')
            ->havingRaw('SUM(jumlah) < 10');

        $stokMenipis = (clone $stokMenipisQuery)->get()->count();
        $stokMenipisItems = $stokMenipisQuery->orderBy('total_jumlah')->limit(5)->get();

        return Inertia::render('Dashboard', [
            'hampirKadaluarsa'         => $hampirKadaluarsa,
            'sudahKadaluarsaCount'     => $sudahKadaluarsa,
            'totalPiutang'             => (float) $totalPiutang,
            'customerBermasalahCount'  => $customerBermasalah,
            'poDraft'                  => $poDraft,
            'omzetHariIni'             => (float) $omzetHariIni,
            'penjualanHariIni'         => $penjualanHariIni,
            'stokMenipis'              => $stokMenipis,
            'stokMenipisItems'         => $stokMenipisItems,
        ]);
    }
}
