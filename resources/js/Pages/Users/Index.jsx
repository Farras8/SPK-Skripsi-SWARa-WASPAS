import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CreateUserForm from './components/CreateUserForm';
import EditUserForm from './components/EditUserForm';

export default function Index({ users, roles }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (userId) => {
        setConfirmDelete(userId);
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Manajemen User
                    </h2>
                    <PrimaryButton onClick={() => setShowCreate(true)}>
                        Tambah User
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Manajemen User" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">
                            {flash.success}
                        </p>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                            {flash.error}
                        </p>
                    </div>
                )}
                
                <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="md">
                    <CreateUserForm roles={roles} onClose={() => setShowCreate(false)} />
                </Modal>
                
                <Modal show={editingUser !== null} onClose={() => setEditingUser(null)} maxWidth="md">
                    {editingUser && (
                        <EditUserForm user={editingUser} roles={roles} onCancel={() => setEditingUser(null)} />
                    )}
                </Modal>

                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-navy-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-navy-900">
                                            {user.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-600">
                                            {user.email}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                    user.role === 'super_admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                {user.role === 'super_admin'
                                                    ? 'Super Admin'
                                                    : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role !== 'super_admin' ? (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="text-primary-600 hover:text-primary-800"
                                                        >
                                                            Edit
                                                        </button>
                                                        <DangerButton
                                                            onClick={() => handleDelete(user.id)}
                                                        >
                                                            Hapus
                                                        </DangerButton>
                                                    </>
                                                ) : (
                                                    <span className="text-navy-400 italic text-xs">Super Admin</span>
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
            show={confirmDelete !== null}
            title="Hapus User"
            message="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('users.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}

