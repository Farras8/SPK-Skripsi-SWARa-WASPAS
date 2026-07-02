import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import CreateSalesForm from './components/CreateSalesForm';

const PAYMENT_BADGE = {
    tunai:  { class: 'bg-blue-100 text-blue-800',   label: '💵 Tunai' },
    kredit: { class: 'bg-orange-100 text-orange-800', label: '📒 Kredit' },
};

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function Index({ sales, filter, stats, products, customers, nomorNota }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSales = sales.filter((s) =>
        s.nomor_nota.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customer?.nama_customer && s.customer.nama_customer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="page-header">Transaksi Penjualan</h2>
                        <p className="text-sm text-navy-500">Stok → Penjualan → Customer / Hutang</p>
                    </div>
                    <PrimaryButton onClick={() => setShowCreate(true)}>
                        + Catat Penjualan
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Transaksi Penjualan" />
            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{flash.error}</p>
                    </div>
                )}
                
                <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="4xl">
                    <CreateSalesForm
                        products={products}
                        customers={customers}
                        nomorNota={nomorNota}
                        onClose={() => setShowCreate(false)}
                    />
                </Modal>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white border-l-4 border-navy-600 p-4 shadow-md">
                        <p className="text-sm text-navy-600">Total Transaksi</p>
                        <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 border-l-4 border-blue-500 p-4 shadow-md">
                        <p className="text-sm text-blue-700">Tunai</p>
                        <p className="text-2xl font-bold text-blue-800">{stats.total_tunai}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 border-l-4 border-orange-500 p-4 shadow-md">
                        <p className="text-sm text-orange-700">Kredit / Kasbon</p>
                        <p className="text-2xl font-bold text-orange-800">{stats.total_kredit}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-4 shadow-md">
                        <p className="text-sm text-green-700">Omzet Hari Ini</p>
                        <p className="text-lg font-bold text-green-800">{fmt(stats.omzet_hari_ini)}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['semua', 'tunai', 'kredit'].map((f) => (
                            <Link
                                key={f}
                                href={route('sales.index', f === 'semua' ? {} : { filter: f })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                                    filter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                }`}
                            >
                                {f === 'semua' ? 'Semua' : PAYMENT_BADGE[f]?.label}
                            </Link>
                        ))}
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-full border border-navy-300 pl-9 pr-4 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
                            placeholder="Cari nota atau customer..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nomor Nota</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tanggal</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Item</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Pembayaran</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                            Belum ada transaksi penjualan.
                                        </td>
                                    </tr>
                                )}
                                {filteredSales.map((s) => (
                                    <tr key={s.id} className="hover:bg-navy-50">
                                        <td className="px-4 py-3 text-sm font-mono font-medium text-navy-900">{s.nomor_nota}</td>
                                        <td className="px-4 py-3 text-sm text-navy-800">
                                            {s.customer?.nama_customer ?? (
                                                <span className="text-gray-400 italic">Walk-in</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-navy-600">
                                            {new Date(s.tanggal_jual).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-navy-700">
                                            {s.items_count} item
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_BADGE[s.jenis_pembayaran]?.class}`}>
                                                {PAYMENT_BADGE[s.jenis_pembayaran]?.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">
                                            {fmt(s.total_harga)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('sales.show', s.id)}
                                                    className="rounded bg-navy-100 px-3 py-1 text-xs font-medium text-navy-700 hover:bg-navy-200"
                                                >
                                                    Detail
                                                </Link>
                                                <DangerButton onClick={() => handleDelete(s.id)}>
                                                    Hapus
                                                </DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Transaksi Penjualan"
            message="Apakah Anda yakin ingin menghapus transaksi ini? Stok akan dikembalikan otomatis, namun tindakan ini tidak dapat diurungkan."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('sales.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
