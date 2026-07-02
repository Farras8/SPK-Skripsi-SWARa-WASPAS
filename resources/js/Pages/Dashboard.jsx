import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ hampirKadaluarsa, sudahKadaluarsaCount, totalPiutang, customerBermasalahCount, poDraft, omzetHariIni, penjualanHariIni, stokMenipis, stokMenipisItems }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="page-header">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                    {stokMenipis > 0 && (
                        <div className="rounded-md border border-orange-200 bg-orange-50 p-4">
                            <div className="flex flex-wrap items-start gap-3">
                                <span className="text-lg">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-orange-800">
                                        {stokMenipis} produk stok menipis (total jumlah &lt; 10) — segera lakukan pembelian!
                                    </p>
                                    <ul className="mt-1 flex flex-wrap gap-2">
                                        {stokMenipisItems.map(s => (
                                            <li key={s.nama_barang} className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                                                {s.nama_barang}: <strong>{s.total_jumlah}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link
                                    href={route('stoks.index')}
                                    className="text-sm font-medium text-orange-700 underline hover:text-orange-900"
                                >
                                    Lihat Stok →
                                </Link>
                            </div>
                        </div>
                    )}

                    {sudahKadaluarsaCount > 0 && (
                        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🚨</span>
                                <p className="text-sm font-semibold text-red-800">
                                    Ada {sudahKadaluarsaCount} barang yang sudah melewati tanggal kadaluarsa!
                                </p>
                                <Link
                                    href={route('stoks.index', { tab: 'expired' })}
                                    className="ml-auto text-sm font-medium text-red-700 underline hover:text-red-900"
                                >
                                    Lihat →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Operasional Hari Ini */}
                    <div className="mb-4 grid gap-4 md:grid-cols-3">
                        <Link href={route('purchase-orders.index', { status: 'draft' })} className="block">
                            <div className="rounded-lg bg-white border-l-4 border-yellow-400 p-4 shadow-md transition hover:shadow-xl hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-navy-500">PO Menunggu Barang</p>
                                        <p className="mt-1 text-2xl font-bold text-yellow-600">{poDraft}</p>
                                    </div>
                                    <span className="text-3xl">🛒</span>
                                </div>
                            </div>
                        </Link>
                        <Link href={route('sales.index')} className="block">
                            <div className="rounded-lg bg-white border-l-4 border-green-400 p-4 shadow-md transition hover:shadow-xl hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-navy-500">Penjualan Hari Ini</p>
                                        <p className="mt-1 text-2xl font-bold text-green-700">{penjualanHariIni} nota</p>
                                    </div>
                                    <span className="text-3xl">💰</span>
                                </div>
                            </div>
                        </Link>
                        <div className="rounded-lg bg-white border-l-4 border-primary-500 p-4 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-navy-500">Omzet Hari Ini</p>
                                    <p className="mt-1 text-lg font-bold text-primary-700">
                                        Rp {Math.round(omzetHariIni).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <span className="text-3xl">📈</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 md:grid-cols-3">
                        <Link href={route('stoks.index', { tab: 'warning' })} className="block">
                            <div className="rounded-lg bg-white border-l-4 border-yellow-500 p-6 shadow-md transition hover:shadow-xl hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-navy-600">Barang Hampir Kadaluarsa</p>
                                        <p className="mt-1 text-3xl font-bold text-yellow-600">{hampirKadaluarsa.length}</p>
                                        <p className="text-xs text-navy-500">dalam 30 hari ke depan</p>
                                    </div>
                                    <span className="text-4xl">📦</span>
                                </div>
                            </div>
                        </Link>

                        <Link href={route('hutangs.index', { filter: 'belum_lunas' })} className="block">
                            <div className="rounded-lg bg-white border-l-4 border-red-500 p-6 shadow-md transition hover:shadow-xl hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-navy-600">Total Piutang Aktif</p>
                                        <p className="mt-1 text-3xl font-bold text-red-600">
                                            Rp {Math.round(totalPiutang).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-navy-500">hutang belum lunas</p>
                                    </div>
                                    <span className="text-4xl">💰</span>
                                </div>
                            </div>
                        </Link>

                        <Link href={route('customers.index', { filter: 'punya_hutang' })} className="block">
                            <div className="rounded-lg bg-white border-l-4 border-orange-500 p-6 shadow-md transition hover:shadow-xl hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-navy-600">Customer Bermasalah</p>
                                        <p className="mt-1 text-3xl font-bold text-orange-600">{customerBermasalahCount}</p>
                                        <p className="text-xs text-navy-500">hutang &gt; 30 hari</p>
                                    </div>
                                    <span className="text-4xl">⚠️</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {hampirKadaluarsa.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">
                                    ⏰ Barang Segera Kadaluarsa
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Nama Barang</th>
                                            <th className="px-6 py-3 text-center text-xs uppercase tracking-wider">Jumlah</th>
                                            <th className="px-6 py-3 text-center text-xs uppercase tracking-wider">Kadaluarsa</th>
                                            <th className="px-6 py-3 text-center text-xs uppercase tracking-wider">Sisa</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {hampirKadaluarsa.map((s) => (
                                            <tr key={s.id} className="bg-yellow-50">
                                                <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">{s.nama_barang}</td>
                                                <td className="whitespace-nowrap px-6 py-3 text-center text-sm text-navy-700">{s.jumlah}</td>
                                                <td className="whitespace-nowrap px-6 py-3 text-center text-sm text-navy-500">
                                                    {new Date(s.tanggal_kadaluarsa).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3 text-center text-sm font-semibold text-yellow-700">
                                                    {s.sisa_hari} hari
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {hampirKadaluarsa.length === 0 && totalPiutang === 0 && (
                        <div className="rounded-lg bg-gradient-to-br from-white to-blue-50 border-2 border-primary-200 p-12 text-center shadow-md">
                            <span className="text-5xl">✅</span>
                            <p className="mt-4 text-lg font-semibold text-navy-700">Semua aman!</p>
                            <p className="text-sm text-navy-500">Tidak ada barang yang akan kadaluarsa dan tidak ada piutang aktif.</p>
                        </div>
                    )}
            </div>
        </AuthenticatedLayout>
    );
}
