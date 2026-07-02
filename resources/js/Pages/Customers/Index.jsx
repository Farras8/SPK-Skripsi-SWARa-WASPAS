import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

const AGING_COLORS = {
    hijau: 'bg-green-100 text-green-800',
    kuning: 'bg-yellow-100 text-yellow-800',
    merah: 'bg-red-100 text-red-800',
};

export default function Index({ customers, filter }) {
    const { flash } = usePage().props;
    const [blacklistReason, setBlacklistReason] = useState('');
    const [showBlacklistModal, setShowBlacklistModal] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = customers.filter((c) =>
        c.nama_customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.no_hp && c.no_hp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.alamat && c.alamat.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const { data: createData, setData: setCreateData, post: postCreate, processing: creating, errors: createErrors, reset: resetCreate } = useForm({
        nama_customer: '',
        alamat: '',
        no_hp: '',
        plafon_kasbon: 500000,
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        nama_customer: '',
        alamat: '',
        no_hp: '',
        plafon_kasbon: 0,
    });

    const openEditModal = (customer) => {
        setEditData({
            nama_customer: customer.nama_customer,
            alamat: customer.alamat || '',
            no_hp: customer.no_hp || '',
            plafon_kasbon: customer.plafon_kasbon,
        });
        setEditingCustomer(customer);
    };

    const handleEditCustomer = (e) => {
        e.preventDefault();
        putEdit(route('customers.update', editingCustomer.id), {
            onSuccess: () => {
                setEditingCustomer(null);
                resetEdit();
            }
        });
    };

    const handleCreateCustomer = (e) => {
        e.preventDefault();
        postCreate(route('customers.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
            }
        });
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const handleBlacklist = (customer) => {
        if (customer.is_blacklisted) {
            router.post(route('customers.toggle-blacklist', customer.id));
        } else {
            setShowBlacklistModal(customer.id);
        }
    };

    const confirmBlacklist = () => {
        router.post(route('customers.toggle-blacklist', showBlacklistModal), {
            alasan_blacklist: blacklistReason,
        });
        setShowBlacklistModal(null);
        setBlacklistReason('');
    };

    const worstAging = (customer) => {
        if (!customer.hutangs || customer.hutangs.length === 0) return null;
        const active = customer.hutangs.filter(h => h.status === 'belum_lunas');
        if (active.length === 0) return null;
        if (active.some(h => h.status_aging === 'merah')) return 'merah';
        if (active.some(h => h.status_aging === 'kuning')) return 'kuning';
        return 'hijau';
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Daftar Customer
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('hutangs.index')}>
                            <PrimaryButton className="bg-amber-600 hover:bg-amber-700">
                                📋 Daftar Hutang
                            </PrimaryButton>
                        </Link>
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            + Tambah Customer
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Kasbon — Daftar Customer" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['semua', 'punya_hutang', 'blacklisted'].map((f) => (
                            <Link
                                key={f}
                                href={route('customers.index', f === 'semua' ? {} : { filter: f })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${filter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                    }`}
                            >
                                {f === 'semua' ? 'Semua' : f === 'punya_hutang' ? 'Punya Hutang' : 'Blacklisted'}
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
                            placeholder="Cari nama, hp, atau alamat..."
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No. HP</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Plafon</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Hutang Aktif</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Sisa</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredCustomers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-navy-400">
                                                Tidak ada data customer.
                                            </td>
                                        </tr>
                                    )}
                                    {filteredCustomers.map((c) => {
                                        const aging = worstAging(c);
                                        return (
                                            <tr key={c.id} className={c.is_blacklisted ? 'bg-red-50' : ''}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {c.nama_customer}
                                                    {c.is_blacklisted && (
                                                        <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-xs text-white">BLACKLIST</span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-600">{c.no_hp || '-'}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-navy-700">
                                                    Rp {parseInt(c.plafon_kasbon).toLocaleString('id-ID')}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-navy-900">
                                                    Rp {parseInt(c.total_hutang_aktif).toLocaleString('id-ID')}
                                                </td>
                                                <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${c.sisa_plafon <= 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    Rp {parseInt(c.sisa_plafon).toLocaleString('id-ID')}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                                    {aging && (
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${AGING_COLORS[aging]}`}>
                                                            {aging === 'hijau' ? '< 1 Minggu' : aging === 'kuning' ? '< 1 Bulan' : '> 1 Bulan'}
                                                        </span>
                                                    )}
                                                    {!aging && <span className="text-xs text-navy-400">Tidak ada hutang</span>}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={route('customers.show', c.id)}
                                                            className="rounded bg-navy-100 px-2 py-1 text-xs font-medium text-navy-700 hover:bg-navy-200"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <button
                                                            onClick={() => openEditModal(c)}
                                                            className="rounded bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleBlacklist(c)}
                                                            className={`rounded px-2 py-1 text-xs font-medium ${c.is_blacklisted
                                                                    ? 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                }`}
                                                        >
                                                            {c.is_blacklisted ? 'Unblock' : '🚫 Blacklist'}
                                                        </button>
                                                        <DangerButton onClick={() => handleDelete(c.id)}>Hapus</DangerButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                {showBlacklistModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h3 className="mb-4 text-lg font-semibold text-navy-900">Blacklist Customer</h3>
                            <textarea
                                value={blacklistReason}
                                onChange={(e) => setBlacklistReason(e.target.value)}
                                placeholder="Alasan blacklist (opsional)..."
                                className="mb-4 w-full rounded-md border-navy-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                rows={3}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setShowBlacklistModal(null); setBlacklistReason(''); }}
                                    className="rounded-md bg-navy-100 px-4 py-2 text-sm text-navy-700 hover:bg-navy-200"
                                >
                                    Batal
                                </button>
                                <DangerButton onClick={confirmBlacklist}>Konfirmasi Blacklist</DangerButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create Customer */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <form onSubmit={handleCreateCustomer} className="p-6 overflow-y-auto max-h-[90vh]">
                    <h2 className="mb-4 text-lg font-medium text-navy-900">Tambah Customer Baru</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="nama_customer" value="Nama Customer" />
                            <TextInput
                                id="nama_customer"
                                type="text"
                                className="mt-1 block w-full"
                                value={createData.nama_customer}
                                onChange={e => setCreateData('nama_customer', e.target.value)}
                            />
                            {createErrors.nama_customer && <p className="mt-1 text-sm text-red-600">{createErrors.nama_customer}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP / WhatsApp" />
                            <TextInput
                                id="no_hp"
                                type="text"
                                className="mt-1 block w-full"
                                value={createData.no_hp}
                                onChange={e => setCreateData('no_hp', e.target.value)}
                            />
                            {createErrors.no_hp && <p className="mt-1 text-sm text-red-600">{createErrors.no_hp}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="alamat" value="Alamat Domisili" />
                            <TextInput
                                id="alamat"
                                type="text"
                                className="mt-1 block w-full"
                                value={createData.alamat}
                                onChange={e => setCreateData('alamat', e.target.value)}
                            />
                            {createErrors.alamat && <p className="mt-1 text-sm text-red-600">{createErrors.alamat}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="plafon_kasbon" value="Limit Kasbon (Plafon)" />
                            <div className="flex items-center mt-1">
                                <span className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500">Rp</span>
                                <TextInput
                                    id="plafon_kasbon"
                                    type="number"
                                    className="block w-full rounded-l-none"
                                    value={createData.plafon_kasbon}
                                    onChange={e => setCreateData('plafon_kasbon', e.target.value)}
                                />
                            </div>
                            {createErrors.plafon_kasbon && <p className="mt-1 text-sm text-red-600">{createErrors.plafon_kasbon}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowCreateModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={creating}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Customer */}
            <Modal show={!!editingCustomer} onClose={() => { setEditingCustomer(null); resetEdit(); }}>
                <form onSubmit={handleEditCustomer} className="p-6 overflow-y-auto max-h-[90vh]">
                    <h2 className="mb-4 text-lg font-medium text-navy-900">Edit Customer</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_nama_customer" value="Nama Customer" />
                            <TextInput
                                id="edit_nama_customer"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.nama_customer}
                                onChange={e => setEditData('nama_customer', e.target.value)}
                            />
                            {editErrors.nama_customer && <p className="mt-1 text-sm text-red-600">{editErrors.nama_customer}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_no_hp" value="No. HP / WhatsApp" />
                            <TextInput
                                id="edit_no_hp"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.no_hp}
                                onChange={e => setEditData('no_hp', e.target.value)}
                            />
                            {editErrors.no_hp && <p className="mt-1 text-sm text-red-600">{editErrors.no_hp}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_alamat" value="Alamat Domisili" />
                            <TextInput
                                id="edit_alamat"
                                type="text"
                                className="mt-1 block w-full"
                                value={editData.alamat}
                                onChange={e => setEditData('alamat', e.target.value)}
                            />
                            {editErrors.alamat && <p className="mt-1 text-sm text-red-600">{editErrors.alamat}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="edit_plafon_kasbon" value="Limit Kasbon (Plafon)" />
                            <div className="flex items-center mt-1">
                                <span className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500">Rp</span>
                                <TextInput
                                    id="edit_plafon_kasbon"
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
                        <SecondaryButton onClick={() => { setEditingCustomer(null); resetEdit(); }}>Batal</SecondaryButton>
                        <PrimaryButton disabled={editProcessing}>Simpan Perubahan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Customer"
            message="Apakah Anda yakin ingin menghapus customer ini? Seluruh riwayat hutang terkait juga akan terhapus."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('customers.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
