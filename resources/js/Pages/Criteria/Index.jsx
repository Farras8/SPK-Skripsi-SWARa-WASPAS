import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CriteriaForm from './components/CriteriaForm';
import EditCriteriaForm from './components/EditCriteriaForm';
import AdvancedModeCalculator from './components/AdvancedModeCalculator';

export default function Index({ criteria, tipeOptions }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const order = criteria.map((c) => c.id);
        [order[index - 1], order[index]] = [order[index], order[index - 1]];
        router.post(route('criteria.reorder'), { order });
    };

    const handleMoveDown = (index) => {
        if (index === criteria.length - 1) return;
        const order = criteria.map((c) => c.id);
        [order[index], order[index + 1]] = [order[index + 1], order[index]];
        router.post(route('criteria.reorder'), { order });
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Pembobotan Kriteria
                    </h2>
                    <PrimaryButton onClick={() => setShowForm(true)}>
                        Tambah Kriteria
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Pembobotan Kriteria" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 shadow-sm">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="md">
                    <CriteriaForm
                        tipeOptions={tipeOptions}
                        onClose={() => setShowForm(false)}
                    />
                </Modal>

                <Modal show={editingId !== null} onClose={() => setEditingId(null)} maxWidth="md">
                    {editingId && (
                        <EditCriteriaForm
                            criterion={criteria.find((c) => c.id === editingId)}
                            tipeOptions={tipeOptions}
                            onCancel={() => setEditingId(null)}
                        />
                    )}
                </Modal>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Daftar Kriteria</h3>
                        <p className="mt-1 text-sm text-navy-600">
                            Gunakan tombol panah untuk mengatur urutan prioritas kriteria.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        Nama Kriteria
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {criteria.map((criterion, index) => (
                                    <tr key={criterion.id}>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {index + 1}
                                                </span>
                                                <div className="flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveUp(index)}
                                                        disabled={index === 0}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMoveDown(index)}
                                                        disabled={index === criteria.length - 1}
                                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-navy-700">
                                            {criterion.nama_kriteria}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${criterion.kategori === 'supplier'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {criterion.kategori === 'supplier' ? 'Supplier' : 'Produk'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${criterion.tipe === 'cost'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                                {criterion.tipe === 'cost' ? 'Cost' : 'Benefit'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(criterion.id)}
                                                    className="text-sm text-primary-600 hover:text-primary-900"
                                                >
                                                    Edit
                                                </button>
                                                <DangerButton onClick={() => handleDelete(criterion.id)}>
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

                <AdvancedModeCalculator criteria={criteria} />
            </div>
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Kriteria"
            message="Apakah Anda yakin ingin menghapus kriteria ini? Data bobot terkait juga akan terhapus."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('criteria.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
