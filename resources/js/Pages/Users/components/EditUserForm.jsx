import React from 'react';
import { useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function EditUserForm({ user, roles, onCancel }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => onCancel()
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-navy-900 mb-6">Edit User</h2>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="edit_name" value="Nama" />
                    <TextInput
                        id="edit_name"
                        value={data.name}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="edit_email" value="Email" />
                    <TextInput
                        id="edit_email"
                        type="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="edit_password" value="Password (kosongkan jika tidak diubah)" />
                    <TextInput
                        id="edit_password"
                        type="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="edit_password_confirmation" value="Konfirmasi Password" />
                    <TextInput
                        id="edit_password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="edit_role" value="Role" />
                    <select
                        id="edit_role"
                        value={data.role}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        onChange={(e) => setData('role', e.target.value)}
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.role} className="mt-1" />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Batal
                    </button>
                    <PrimaryButton disabled={processing}>Perbarui User</PrimaryButton>
                </div>
            </form>
        </div>
    );
}
