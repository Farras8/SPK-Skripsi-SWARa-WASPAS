import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

const AGING_BADGE = {
    hijau: { class: 'bg-green-100 text-green-800', label: '🟢 < 1 Minggu' },
    kuning: { class: 'bg-yellow-100 text-yellow-800', label: '🟡 < 1 Bulan' },
    merah: { class: 'bg-red-100 text-red-800', label: '🔴 > 1 Bulan' },
    lunas: { class: 'bg-blue-100 text-blue-800', label: '✅ Lunas' },
};

export default function Show({ customer, stats }) {
    const { flash } = usePage().props;
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmLunasi, setConfirmLunasi] = useState(null);

    const { data: editData, setData: setEditData, put: putEdit, processing: editing, errors: editErrors } = useForm({
        nama_customer: customer.nama_customer,
        alamat: customer.alamat || '',
        no_hp: customer.no_hp || '',
        plafon_kasbon: customer.plafon_kasbon,
    });

    const handleEditCustomer = (e) => {
        e.preventDefault();
        putEdit(route('customers.update', customer.id), {
            onSuccess: () => setShowEditModal(false)
        });
    };

    const handleLunasi = (id) => {
        setConfirmLunasi(id);
    };

    const plafonPct = Math.min(100, Math.round((stats.total_outstanding / parseFloat(customer.plafon_kasbon)) * 100));

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('customers.index')} className="text-sm text-primary-600 hover:text-primary-800">
                        ← Kembali ke Daftar Customer
                    </Link>
                    <h2 className="page-header">Detail Customer: {customer.nama_customer}</h2>
                </div>
            }
        >
            <Head title={`Customer — ${customer.nama_customer}`} />
            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                {/* Profil Customer */}
                <div className="card p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-navy-900">{customer.nama_customer}</h3>
                            {customer.is_blacklisted && (
                                <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                                    🚫 BLACKLISTED
                                </span>
                            )}
                            <p className="text-sm text-navy-600">📞 {customer.no_hp || 'Tidak ada nomor'}</p>
                            {customer.alamat && <p className="text-sm text-navy-600">📍 {customer.alamat}</p>}
                            {customer.alasan_blacklist && (
                                <p className="text-xs text-red-600">Alasan: {customer.alasan_blacklist}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="rounded-md bg-navy-100 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-200">
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Plafon bar */}
                    <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-xs text-navy-600">
                            <span>Penggunaan Plafon ({plafonPct}%)</span>
                            <span>{fmt(stats.total_outstanding)} / {fmt(customer.plafon_kasbon)}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200">
                            <div
                                className={`h-3 rounded-full transition-all ${
                                    plafonPct >= 100 ? 'bg-red-500' : plafonPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${plafonPct}%` }}
                            />
                        </div>
                        <p className={`text-sm font-semibold ${customer.sisa_plafon <= 0 ? 'text-red-600' : 'text-green-700'}`}>
                            Sisa Plafon: {fmt(customer.sisa_plafon)}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white border-l-4 border-navy-600 p-4 shadow-md">
                        <p className="text-xs text-navy-500">Total Transaksi</p>
                        <p className="text-2xl font-bold text-navy-900">{stats.total_hutang}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 border-l-4 border-orange-500 p-4 shadow-md">
                        <p className="text-xs text-orange-600">Belum Lunas</p>
                        <p className="text-2xl font-bold text-orange-800">{stats.belum_lunas}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 border-l-4 border-green-500 p-4 shadow-md">
                        <p className="text-xs text-green-600">Sudah Lunas</p>
                        <p className="text-2xl font-bold text-green-800">{stats.lunas}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
                        <p className="text-xs text-red-600">Outstanding</p>
                        <p className="text-sm font-bold text-red-800">{fmt(stats.total_outstanding)}</p>
                    </div>
                </div>

                {/* Riwayat Hutang */}
                <div className="card">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                        <h3 className="text-base font-semibold text-navy-800">📒 Riwayat Hutang / Kasbon</h3>
                    </div>

                    {customer.hutangs.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">Belum ada riwayat hutang.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aging</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lunas</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {customer.hutangs.map((h) => (
                                        <tr key={h.id}
                                            className={h.status === 'belum_lunas' && h.status_aging === 'merah'
                                                ? 'bg-red-50' : h.status === 'belum_lunas' && h.status_aging === 'kuning'
                                                ? 'bg-yellow-50' : ''}>
                                            <td className="px-4 py-3 text-sm text-navy-700">
                                                {new Date(h.tanggal_hutang).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-navy-700 max-w-xs truncate">
                                                {h.keterangan || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">
                                                {fmt(h.jumlah_hutang)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {h.status === 'belum_lunas' ? (
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${AGING_BADGE[h.status_aging]?.class}`}>
                                                        {AGING_BADGE[h.status_aging]?.label}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    h.status === 'lunas'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {h.status === 'lunas' ? '✅ Lunas' : '⏳ Belum'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-500">
                                                {h.tanggal_lunas
                                                    ? new Date(h.tanggal_lunas).toLocaleDateString('id-ID')
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {h.status === 'belum_lunas' && (
                                                    <button
                                                        onClick={() => handleLunasi(h.id)}
                                                        className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                                                    >
                                                        Lunasi
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-navy-50">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-2 text-right text-xs font-semibold text-navy-700">
                                            Total Pernah Hutang:
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm font-bold text-navy-900">
                                            {fmt(stats.total_pernah_hutang)}
                                        </td>
                                        <td colSpan={4}></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edit Customer */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleEditCustomer} className="p-6 overflow-y-auto max-h-[90vh]">
                    <h2 className="mb-4 text-lg font-medium text-navy-900">Edit Customer</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="nama_customer" value="Nama Customer" />
                            <TextInput
                                id="nama_customer"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.nama_customer}
                                onChange={e => setEditData('nama_customer', e.target.value)}
                            />
                            {editErrors.nama_customer && <p className="mt-1 text-sm text-red-600">{editErrors.nama_customer}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP / WhatsApp" />
                            <TextInput
                                id="no_hp"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.no_hp}
                                onChange={e => setEditData('no_hp', e.target.value)}
                            />
                            {editErrors.no_hp && <p className="mt-1 text-sm text-red-600">{editErrors.no_hp}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="alamat" value="Alamat Domisili" />
                            <TextInput
                                id="alamat"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.alamat}
                                onChange={e => setEditData('alamat', e.target.value)}
                            />
                            {editErrors.alamat && <p className="mt-1 text-sm text-red-600">{editErrors.alamat}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="plafon_kasbon" value="Limit Kasbon (Plafon)" />
                            <div className="flex items-center mt-1">
                                <span className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500">Rp</span>
                                <TextInput
                                    id="plafon_kasbon"
                                    type="number"
                                    className="block w-full rounded-l-none"
                                    value={editData.plafon_kasbon}
                                    onChange={e => setEditData('plafon_kasbon', e.target.value)}
                                />
                            </div>
                            {editErrors.plafon_kasbon && <p className="mt-1 text-sm text-red-600">{editErrors.plafon_kasbon}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowEditModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={editing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
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
        </>
    );
}
