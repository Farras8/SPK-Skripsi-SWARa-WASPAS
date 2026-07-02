import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ProductFormModal from './components/ProductFormModal';

const KATEGORI_OPTIONS = [
    'Air Mineral (AMDK)',
    'Minuman Rasa & Isotonik',
    'Minuman Teh & Kopi',
    'Minuman Energi',
    'Gas Elpiji',
];

export default function Index({ products }) {
    const { flash } = usePage().props;
    
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter((p) =>
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.kategori && p.kategori.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const grouped = filteredProducts.reduce((acc, product) => {
        const key = product.kategori || 'Tanpa Kategori';
        if (!acc[key]) acc[key] = [];
        acc[key].push(product);
        return acc;
    }, {});

    const openCreateModal = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleDelete = (productId) => {
        setConfirmDelete(productId);
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Data Produk
                    </h2>
                    <PrimaryButton onClick={openCreateModal}>
                        Tambah Produk
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Data Produk" />

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

                <div className="mb-4 flex justify-end">
                <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-full border border-navy-300 pl-9 pr-4 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
                        placeholder="Cari nama atau kategori..."
                    />
                </div>
            </div>

            <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Nama Produk
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {Object.entries(grouped).map(([kategori, items]) => (
                                    items.map((product, index) => (
                                        <tr key={product.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-600">
                                                {products.indexOf(product) + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-navy-900">
                                                {product.nama_produk}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-navy-600">
                                                {product.kategori || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('products.manage-suppliers', product.id)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                                                    >
                                                        💰 Atur Supplier
                                                    </Link>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="text-primary-600 hover:text-primary-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <DangerButton
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        Hapus
                                                    </DangerButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ProductFormModal
                showModal={showModal}
                closeModal={closeModal}
                editingProduct={editingProduct}
                kategoriOptions={KATEGORI_OPTIONS}
            />
        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Produk"
            message="Apakah Anda yakin ingin menghapus produk ini? Data terkait seperti stok dan relasi supplier juga akan terpengaruh."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('products.destroy', confirmDelete)); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}

