import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CreateHutangForm from './components/CreateHutangForm';

const AGING_STYLES = {
    hijau: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    kuning: 'bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500',
    merah: 'bg-red-50 text-red-900 border-l-4 border-red-500',
    lunas: '',
};

const AGING_BADGE = {
    hijau: { class: 'bg-green-100 text-green-800', label: '🟢 < 1 Minggu' },
    kuning: { class: 'bg-yellow-100 text-yellow-800', label: '🟡 < 1 Bulan' },
    merah: { class: 'bg-red-100 text-red-800', label: '🔴 > 1 Bulan' },
    lunas: { class: 'bg-blue-100 text-blue-800', label: '✅ Lunas' },
};

export default function Index({ hutangs, filter, customers }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [confirmLunasi, setConfirmLunasi] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHutangs = hutangs.filter((h) =>
        (h.customer?.nama_customer && h.customer.nama_customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (h.keterangan && h.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleLunasi = (id) => {
        setConfirmLunasi(id);
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const totalBelumLunas = hutangs
        .filter((h) => h.status === 'belum_lunas')
        .reduce((sum, h) => sum + parseFloat(h.jumlah_hutang), 0);

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <Link href={route('customers.index')} className="text-sm text-primary-600 hover:text-primary-800">
                            ← Kembali ke Daftar Customer
                        </Link>
                        <h2 className="page-header">Daftar Hutang</h2>
                    </div>
                    <PrimaryButton onClick={() => setShowCreate(true)}>
                        + Catat Kasbon
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Kasbon — Daftar Hutang" />

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
                
                <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="md">
                    <CreateHutangForm customers={customers} onClose={() => setShowCreate(false)} />
                </Modal>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['semua', 'belum_lunas', 'lunas'].map((f) => (
                            <Link
                                key={f}
                                href={route('hutangs.index', f === 'semua' ? {} : { filter: f })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                    }`}
                            >
                                {f === 'semua' ? 'Semua' : f === 'belum_lunas' ? 'Belum Lunas' : 'Lunas'}
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
                            placeholder="Cari customer atau keterangan..."
                        />
                    </div>
                </div>
                {totalBelumLunas > 0 && (
                    <div className="flex">
                        <div className="rounded-lg bg-red-50 px-4 py-2 border-l-4 border-red-500">
                            <span className="text-sm font-semibold text-red-700">
                                Total Piutang: Rp {Math.round(totalBelumLunas).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Umur</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredHutangs.map((h) => (
                                    <tr key={h.id} className={AGING_STYLES[h.status_aging]}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-navy-900">
                                            {h.customer?.nama_customer}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-navy-900">
                                            Rp {parseInt(h.jumlah_hutang).toLocaleString('id-ID')}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-600">
                                            {new Date(h.tanggal_hutang).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-700">
                                            {h.status === 'belum_lunas' ? `${h.umur_hari} hari` : '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${AGING_BADGE[h.status_aging].class}`}>
                                                {AGING_BADGE[h.status_aging].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-navy-600">{h.keterangan || '-'}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            <div className="flex items-center justify-end gap-2">
                                                {h.status === 'belum_lunas' && (
                                                    <button
                                                        onClick={() => handleLunasi(h.id)}
                                                        className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                                    >
                                                        ✅ Lunasi
                                                    </button>
                                                )}
                                                <DangerButton onClick={() => handleDelete(h.id)}>Hapus</DangerButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHutangs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-navy-400">
                                            Tidak ada data hutang.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmLunasi !== null}
            title="Tandai Lunas"
            message="Apakah Anda yakin ingin menandai hutang ini sebagai lunas? Status tidak dapat diubah kembali."
            confirmLabel="Ya, Tandai Lunas"
            variant="warning"
            icon="✅"
            onConfirm={() => { router.post(route('hutangs.lunasi', confirmLunasi)); setConfirmLunasi(null); }}
            onCancel={() => setConfirmLunasi(null)}
        />

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Catatan Hutang"
            message="Apakah Anda yakin ingin menghapus catatan hutang ini? Tindakan ini tidak dapat dibatalkan."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('hutangs.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
