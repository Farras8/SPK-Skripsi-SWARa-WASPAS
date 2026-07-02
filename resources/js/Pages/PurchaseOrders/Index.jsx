import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import CreatePurchaseOrderForm from './components/CreatePurchaseOrderForm';

const STATUS_STYLES = {
    draft:       { class: 'bg-yellow-100 text-yellow-800', label: '⏳ Draft' },
    diterima:    { class: 'bg-green-100 text-green-800',   label: '✅ Diterima' },
    dibatalkan:  { class: 'bg-red-100 text-red-800',       label: '❌ Dibatalkan' },
};

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function Index({ purchaseOrders, status, stats, suppliers, products, supplierProducts, nomorPo, defaultSupplierId, defaultProductId }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(defaultSupplierId !== null || defaultProductId !== null);
    const [confirmCancelId, setConfirmCancelId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPurchaseOrders = purchaseOrders.filter((po) =>
        po.nomor_po.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (po.supplier?.nama_supplier && po.supplier.nama_supplier.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCancel = (id) => {
        setConfirmCancelId(id);
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="page-header">Transaksi Pembelian</h2>
                        <p className="text-sm text-navy-500">SPK WASPAS → Purchase Order → Stok</p>
                    </div>
                    <PrimaryButton onClick={() => setShowCreate(true)}>
                        + Buat PO
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Purchase Orders" />
            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}
                
                <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="4xl">
                    <CreatePurchaseOrderForm 
                        suppliers={suppliers} 
                        products={products} 
                        supplierProducts={supplierProducts}
                        defaultSupplierId={defaultSupplierId} 
                        defaultProductId={defaultProductId} 
                        nomorPo={nomorPo} 
                        onClose={() => setShowCreate(false)} 
                    />
                </Modal>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg bg-white border-l-4 border-navy-600 p-4 shadow-md">
                        <p className="text-sm text-navy-600">Total PO</p>
                        <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-500 p-4 shadow-md">
                        <p className="text-sm text-yellow-700">Menunggu Barang</p>
                        <p className="text-2xl font-bold text-yellow-800">{stats.draft}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-4 shadow-md">
                        <p className="text-sm text-green-700">Sudah Diterima</p>
                        <p className="text-2xl font-bold text-green-800">{stats.diterima}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['semua', 'draft', 'diterima', 'dibatalkan'].map((f) => (
                            <Link
                                key={f}
                                href={route('purchase-orders.index', f === 'semua' ? {} : { status: f })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                                    status === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                }`}
                            >
                                {f === 'semua' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
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
                            placeholder="Cari PO atau supplier..."
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nomor PO</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Supplier</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Produk</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tgl PO</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredPurchaseOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                            Belum ada Purchase Order.
                                        </td>
                                    </tr>
                                )}
                                {filteredPurchaseOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-navy-50">
                                        <td className="px-4 py-3 text-sm font-mono font-medium text-navy-900">{po.nomor_po}</td>
                                        <td className="px-4 py-3 text-sm text-navy-800">{po.supplier?.nama_supplier}</td>
                                        <td className="px-4 py-3 text-sm text-navy-600">{po.product?.nama_produk ?? '—'}</td>
                                        <td className="px-4 py-3 text-center text-sm text-navy-600">
                                            {new Date(po.tanggal_po).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">
                                            {fmt(po.total_harga)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[po.status]?.class}`}>
                                                {STATUS_STYLES[po.status]?.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('purchase-orders.show', po.id)}
                                                    className="rounded bg-navy-100 px-3 py-1 text-xs font-medium text-navy-700 hover:bg-navy-200"
                                                >
                                                    Detail
                                                </Link>
                                                {po.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleCancel(po.id)}
                                                        className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                                                    >
                                                        Batal
                                                    </button>
                                                )}
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
            show={confirmCancelId !== null}
            title="Batalkan Purchase Order"
            message="Apakah Anda yakin ingin membatalkan Purchase Order ini? Tindakan ini tidak dapat diurungkan."
            confirmLabel="Ya, Batalkan PO"
            variant="danger"
            onConfirm={() => { router.post(route('purchase-orders.cancel', confirmCancelId)); setConfirmCancelId(null); }}
            onCancel={() => setConfirmCancelId(null)}
        />
        </>
    );
}
