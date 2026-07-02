import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_STYLES = {
    draft:      { class: 'bg-yellow-100 text-yellow-800', label: '⏳ Menunggu Barang' },
    diterima:   { class: 'bg-green-100 text-green-800',   label: '✅ Diterima' },
    dibatalkan: { class: 'bg-red-100 text-red-800',       label: '❌ Dibatalkan' },
};

const fmt = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function Show({ purchaseOrder }) {
    const { flash } = usePage().props;
    const po = purchaseOrder;
    const [confirmReceive, setConfirmReceive] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const handleReceive = () => {
        setConfirmReceive(true);
    };

    const handleCancel = () => {
        setConfirmCancel(true);
    };

    return (
        <>
            <AuthenticatedLayout
                header={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <Link href={route('purchase-orders.index')} className="text-sm text-primary-600 hover:text-primary-800">
                                ← Kembali ke Daftar PO
                            </Link>
                            <h2 className="page-header">Detail PO: {po.nomor_po}</h2>
                        </div>
                    </div>
                }
            >
                <Head title={`Detail PO ${po.nomor_po}`} />
                <div className="space-y-6">
                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm font-medium text-green-800">{flash.success}</p>
                        </div>
                    )}

                    {/* Info Header */}
                    <div className="card p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Nomor PO:</span>{' '}
                                        <span className="font-mono font-semibold text-navy-900">{po.nomor_po}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Tanggal PO:</span>{' '}
                                        <span className="font-medium text-navy-800">
                                            {new Date(po.tanggal_po).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Supplier:</span>{' '}
                                        <span className="font-semibold text-navy-900">{po.supplier?.nama_supplier}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Produk Referensi:</span>{' '}
                                        <span className="font-medium text-navy-800">{po.product?.nama_produk ?? '—'}</span>
                                    </div>
                                    {po.tanggal_terima && (
                                        <div>
                                            <span className="text-gray-500">Tgl Diterima:</span>{' '}
                                            <span className="font-medium text-green-700">
                                                {new Date(po.tanggal_terima).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                            </span>
                                        </div>
                                    )}
                                    {po.keterangan && (
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Keterangan:</span>{' '}
                                            <span className="text-navy-700">{po.keterangan}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className={`rounded-full px-4 py-2 text-sm font-semibold shrink-0 ${STATUS_STYLES[po.status]?.class}`}>
                                {STATUS_STYLES[po.status]?.label}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="card overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-base font-semibold text-navy-800">
                                📦 Daftar Barang
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Barang</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Jumlah</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Harga Satuan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Potongan/Unit</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Harga Bersih</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tgl Kadaluarsa</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {po.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-navy-50">
                                            <td className="px-4 py-3 text-sm font-medium text-navy-900">{item.nama_barang}</td>
                                            <td className="px-4 py-3 text-center text-sm text-navy-700">{item.jumlah}</td>
                                            <td className="px-4 py-3 text-right text-sm text-navy-700">{fmt(item.harga_satuan)}</td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {parseFloat(item.diskon_satuan) > 0
                                                    ? <span className="text-blue-600 font-medium">-{fmt(item.diskon_satuan)}</span>
                                                    : <span className="text-gray-400">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-700">
                                                {fmt(parseFloat(item.harga_satuan) - parseFloat(item.diskon_satuan || 0))}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-navy-600">
                                                {item.tanggal_kadaluarsa
                                                    ? new Date(item.tanggal_kadaluarsa).toLocaleDateString('id-ID')
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">
                                                {fmt(item.total_harga)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-navy-50">
                                    <tr>
                                        <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-navy-800">
                                            Total Harga PO (setelah potongan):
                                        </td>
                                        <td className="px-4 py-3 text-right text-base font-bold text-primary-700">
                                            {fmt(po.total_harga)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    {po.status === 'draft' && (
                        <div className="card p-4 sm:p-6 bg-yellow-50 border border-yellow-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">⏳ Menunggu Penerimaan Barang</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Klik tombol "Terima Barang" ketika barang dari supplier sudah datang.
                                        Stok akan otomatis bertambah.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 sm:flex-none rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-5 py-2.5 text-sm font-semibold shadow-sm active:scale-95 transition"
                                    >
                                        ❌ Batalkan PO
                                    </button>
                                    <button
                                        onClick={handleReceive}
                                        className="flex-1 sm:flex-none rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700 active:scale-95 transition"
                                    >
                                        ✅ Terima Barang
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {po.status === 'diterima' && (
                        <div className="card p-4 sm:p-6 bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-green-800">
                                ✅ Barang sudah diterima pada {new Date(po.tanggal_terima).toLocaleDateString('id-ID', { dateStyle: 'long' })}.
                                Stok sudah diperbarui secara otomatis.
                            </p>
                            <Link href={route('stoks.index')} className="mt-2 inline-block text-xs text-green-700 underline hover:text-green-900">
                                Lihat Stok →
                            </Link>
                        </div>
                    )}
                </div>
            </AuthenticatedLayout>

            <ConfirmDialog
                show={confirmReceive}
                title="Konfirmasi Penerimaan Barang"
                message="Apakah barang dari supplier sudah diterima? Stok akan otomatis bertambah sesuai isi Purchase Order ini."
                confirmLabel="Ya, Terima Barang"
                variant="info"
                icon="✅"
                onConfirm={() => { router.post(route('purchase-orders.receive', po.id)); setConfirmReceive(false); }}
                onCancel={() => setConfirmReceive(false)}
            />

            <ConfirmDialog
                show={confirmCancel}
                title="Batalkan Purchase Order"
                message="Apakah Anda yakin ingin membatalkan Purchase Order ini? Tindakan ini tidak dapat diurungkan."
                confirmLabel="Ya, Batalkan PO"
                variant="danger"
                onConfirm={() => { router.post(route('purchase-orders.cancel', po.id)); setConfirmCancel(false); }}
                onCancel={() => setConfirmCancel(false)}
            />
        </>
    );
}
