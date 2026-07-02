import React from 'react';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function PenjualanTable({ penjualan, summary }) {
    return (
        <div className="card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base font-semibold text-navy-800">
                    💰 Transaksi Penjualan
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nomor Nota</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Customer</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase">Tanggal</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase">Pembayaran</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase">Item/Qty</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {penjualan.map((s) => (
                            <tr key={s.id} className="hover:bg-navy-50">
                                <td className="px-4 py-3 text-sm font-mono font-medium text-navy-900">{s.nomor_nota}</td>
                                <td className="px-4 py-3 text-sm text-navy-800">
                                    {s.customer ?? <span className="italic text-gray-400">Walk-in</span>}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-navy-600">
                                    {new Date(s.tanggal).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        s.jenis_pembayaran === 'tunai' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                    }`}>
                                        {s.jenis_pembayaran === 'tunai' ? '💵 Tunai' : '📒 Kredit'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-navy-600">
                                    {s.items_count} jenis / {s.total_item_qty} pcs
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">{fmt(s.total_harga)}</td>
                            </tr>
                        ))}
                        {penjualan.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400">
                                    Tidak ada penjualan dalam periode ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {penjualan.length > 0 && (
                        <tfoot className="bg-green-50">
                            <tr>
                                <td colSpan={5} className="px-4 py-3 text-right text-sm font-bold text-navy-800">Total Omzet:</td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{fmt(summary.nilai_keluar)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
