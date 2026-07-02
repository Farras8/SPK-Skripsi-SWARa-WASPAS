import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SupplierFormModal from './components/SupplierFormModal';

export default function Index({ suppliers, criteria }) {
    const { flash, auth } = usePage().props;
    const isSuperAdmin = auth.user.role === 'super_admin';
    
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSuppliers = suppliers.filter((s) =>
        s.nama_supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingSupplier(null);
        setShowModal(true);
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
    };

    const handleDelete = (supplierId) => {
        setConfirmDelete(supplierId);
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Data Supplier
                    </h2>
                    {isSuperAdmin && (
                        <PrimaryButton onClick={openCreateModal}>
                            Tambah Supplier
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title="Data Supplier" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">
                        {flash.success}
                    </p>
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-full border border-navy-300 pl-9 pr-4 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
                        placeholder="Cari nama supplier..."
                    />
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                                    Nama Supplier
                                </th>
                                <th className="px-6 py-3 text-center text-xs uppercase tracking-wider">
                                    Potongan Tunai
                                </th>
                                {criteria.map((c) => (
                                    <th key={c.id} className="px-6 py-3 text-center text-xs uppercase tracking-wider">
                                        {c.nama_kriteria}
                                    </th>
                                ))}
                                {isSuperAdmin && (
                                    <th className="px-6 py-3 text-right text-xs uppercase tracking-wider">
                                        Aksi
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredSuppliers.map((supplier, index) => (
                                <tr key={supplier.id}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-500">
                                        {index + 1}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {supplier.nama_supplier}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-navy-600 max-w-xs">
                                        {supplier.potongan_tunai
                                            ? <span className="text-green-700 font-medium">{supplier.potongan_tunai}</span>
                                            : <span className="text-gray-400 italic text-xs">—</span>
                                        }
                                    </td>
                                    {criteria.map((c) => {
                                        const fieldName = 'criteria_' + c.id;
                                        const value = supplier[fieldName];
                                        
                                        if (!value) {
                                            return (
                                                <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-500">
                                                    -
                                                </td>
                                            );
                                        }
                                        
                                        if (c.tipe === 'benefit') {
                                            const intValue = Math.round(Number.parseFloat(value));
                                            let label = '';
                                            if (c.options && Array.isArray(c.options) && c.options.length === 5) {
                                                label = c.options[5 - intValue] || '';
                                            }
                                            if (!label) {
                                                const fallbackLabels = {
                                                    5: '★★★★★ Sangat Baik',
                                                    4: '★★★★☆ Baik',
                                                    3: '★★★☆☆ Biasa',
                                                    2: '★★☆☆☆ Buruk',
                                                    1: '★☆☆☆☆ Sangat Buruk',
                                                };
                                                label = fallbackLabels[intValue] || value;
                                            }
                                            
                                            if (c.nama_kriteria === 'Pelayanan') {
                                                return (
                                                    <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center">
                                                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            intValue >= 4 ? 'bg-green-100 text-green-800' :
                                                            intValue === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {label}
                                                        </span>
                                                    </td>
                                                );
                                            }
                                            
                                            return (
                                                <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-500">
                                                    {label}
                                                </td>
                                            );
                                        }
                                        
                                        if (c.tipe === 'cost') {
                                            if (c.options && Array.isArray(c.options) && c.options.length === 5) {
                                                const intValue = Math.round(Number.parseFloat(value));
                                                const label = c.options[intValue - 1] || value;
                                                return (
                                                    <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-500">
                                                        {label}
                                                    </td>
                                                );
                                            }
                                            const floatValue = Number.parseFloat(value);
                                            const hasUnit = c.satuan && c.satuan.trim() !== '';
                                            
                                            return (
                                                <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-500">
                                                    {floatValue.toLocaleString('id-ID')}{hasUnit ? ` ${c.satuan}` : ''}
                                                </td>
                                            );
                                        }
                                        
                                        return (
                                            <td key={c.id} className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-500">
                                                {value}
                                            </td>
                                        );
                                    })}
                                    {isSuperAdmin && (
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(supplier)}
                                                    className="text-primary-600 hover:text-primary-800"
                                                >
                                                    Edit
                                                </button>
                                                <DangerButton
                                                    onClick={() => handleDelete(supplier.id)}
                                                >
                                                    Hapus
                                                </DangerButton>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SupplierFormModal
                showModal={showModal}
                closeModal={closeModal}
                editingSupplier={editingSupplier}
                criteria={criteria}
            />
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Supplier"
            message="Apakah Anda yakin ingin menghapus supplier ini? Tindakan ini tidak dapat dibatalkan."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('suppliers.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
