import React from 'react';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function PoMasukTable({ poMasuk, summary }) {
    return (
        <div className="card overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base font-semibold text-navy-800">
                    🛒 Purchase Order Diterima
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nomor PO</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Supplier</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase">Tgl Terima</th>
                            <th className="px-4 py-3 text-center text-xs font-medium uppercase">Item/Qty</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {poMasuk.map((po) => (
                            <tr key={po.id} className="hover:bg-navy-50">
                                <td className="px-4 py-3 text-sm font-mono font-medium text-navy-900">{po.nomor_po}</td>
                                <td className="px-4 py-3 text-sm text-navy-800">{po.supplier}</td>
                                <td className="px-4 py-3 text-center text-sm text-navy-600">
                                    {new Date(po.tanggal).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-navy-600">
                                    {po.items_count} jenis / {po.total_item_qty} pcs
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">{fmt(po.total_harga)}</td>
                            </tr>
                        ))}
                        {poMasuk.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                                    Tidak ada PO diterima dalam periode ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {poMasuk.length > 0 && (
                        <tfoot className="bg-blue-50">
                            <tr>
                                <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-navy-800">Total Nilai Masuk:</td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">{fmt(summary.nilai_masuk)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
