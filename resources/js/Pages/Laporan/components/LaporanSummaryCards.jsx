import React from 'react';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function LaporanSummaryCards({ summary }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-blue-50 border-l-4 border-blue-500 p-4 shadow-md">
                <p className="text-xs text-blue-700">Nilai Masuk (PO)</p>
                <p className="text-lg font-bold text-blue-900">{fmt(summary.nilai_masuk)}</p>
                <p className="text-xs text-blue-600">{summary.total_po_masuk} PO diterima</p>
            </div>
            <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-4 shadow-md">
                <p className="text-xs text-green-700">Omzet Penjualan</p>
                <p className="text-lg font-bold text-green-900">{fmt(summary.nilai_keluar)}</p>
                <p className="text-xs text-green-600">{summary.total_penjualan} nota</p>
            </div>
            <div className="rounded-lg bg-purple-50 border-l-4 border-purple-500 p-4 shadow-md">
                <p className="text-xs text-purple-700">Tunai</p>
                <p className="text-lg font-bold text-purple-900">{fmt(summary.omzet_tunai)}</p>
                <p className="text-xs text-orange-600">Kredit: {fmt(summary.omzet_kredit)}</p>
            </div>
            <div className={`rounded-lg border-l-4 p-4 shadow-md ${
                summary.laba_kotor >= 0 ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'
            }`}>
                <p className={`text-xs ${summary.laba_kotor >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    Selisih (Jual − Beli)
                </p>
                <p className={`text-lg font-bold ${summary.laba_kotor >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                    {fmt(summary.laba_kotor)}
                </p>
                <p className="text-xs text-gray-500">estimasi kasar</p>
            </div>
        </div>
    );
}
