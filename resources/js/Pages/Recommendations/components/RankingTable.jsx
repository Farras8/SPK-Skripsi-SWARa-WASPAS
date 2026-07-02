import React from 'react';
import { Link } from '@inertiajs/react';

const PELAYANAN_LABELS = {
    5: 'Sangat Baik',
    4: 'Baik',
    3: 'Biasa',
    2: 'Buruk',
    1: 'Sangat Buruk',
};

const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const toRoundedInt = (value) => {
    const parsed = parseNumericValue(value);
    return parsed === null ? null : Math.round(parsed);
};

const hasNumericValue = (value) => parseNumericValue(value) !== null;

const getPelayananBadgeClass = (value) => {
    const pelayanan = toRoundedInt(value);
    if (pelayanan >= 4) return 'bg-green-100 text-green-800';
    if (pelayanan === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
};

export default function RankingTable({ rankings, selectedProductId, selectedProduct }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    Hasil Ranking — {selectedProduct.nama_produk}
                </h3>
                <p className="mt-1 text-sm text-navy-600">
                    Supplier diurutkan berdasarkan skor WASPAS tertinggi (metode gabungan WSM + WPM, λ = 0.5).
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Ranking
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Nama Supplier
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Skor Akhir (Qi)
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                Harga Satuan
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Jam Kirim
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Pelayanan
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Status
                            </th>
                            <th className="no-print px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {rankings.map((r) => (
                            <tr
                                key={r.supplier_id}
                                className={r.ranking === 1 ? 'bg-primary-50' : 'hover:bg-navy-50'}
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="text-lg font-bold text-navy-900">
                                        {r.ranking === 1 ? '🏆 ' : ''}{r.ranking}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-navy-900">
                                    {r.nama_supplier}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <span className="text-sm font-bold text-primary-600">
                                        {r.qi.toFixed(4)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-navy-700">
                                    {r.harga_satuan
                                        ? `Rp ${parseInt(r.harga_satuan).toLocaleString('id-ID')}`
                                        : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-700">
                                    {hasNumericValue(r.jam_kirim) ? `${toRoundedInt(r.jam_kirim)} Jam` : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    {hasNumericValue(r.pelayanan) ? (
                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPelayananBadgeClass(r.pelayanan)}`}>
                                            {PELAYANAN_LABELS[toRoundedInt(r.pelayanan)] ?? toRoundedInt(r.pelayanan)}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${r.ranking === 1
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-navy-100 text-navy-700'
                                    }`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="no-print whitespace-nowrap px-6 py-4 text-center">
                                    <Link
                                        href={route('purchase-orders.create', {
                                            supplier_id: r.supplier_id,
                                            product_id: selectedProductId,
                                        })}
                                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95 ${
                                            r.ranking === 1
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                        }`}
                                    >
                                        🛒 Buat PO
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
