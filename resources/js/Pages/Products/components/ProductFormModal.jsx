import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ProductFormModal({ showModal, closeModal, editingProduct, kategoriOptions }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_produk: '',
        kategori: kategoriOptions[0] || '',
    });

    useEffect(() => {
        if (editingProduct) {
            setData({
                nama_produk: editingProduct.nama_produk || '',
                kategori: editingProduct.kategori || kategoriOptions[0] || '',
            });
        } else {
            reset();
            setData('kategori', kategoriOptions[0] || '');
        }
    }, [editingProduct]);

    const submit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    return (
        <Modal show={showModal} onClose={closeModal} maxWidth="2xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-navy-900">
                    {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </h2>

                <div className="mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="nama_produk" value="Nama Produk" />
                        <TextInput
                            id="nama_produk"
                            value={data.nama_produk}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('nama_produk', e.target.value)}
                        />
                        <InputError message={errors.nama_produk} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="kategori" value="Kategori" />
                        <select
                            id="kategori"
                            value={data.kategori}
                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            onChange={(e) => setData('kategori', e.target.value)}
                        >
                            {kategoriOptions.map((k) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </select>
                        <InputError message={errors.kategori} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={closeModal}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {editingProduct ? 'Perbarui' : 'Simpan'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
