import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const KATEGORI_OPTIONS = [
    'Air Mineral (AMDK)',
    'Minuman Rasa & Isotonik',
    'Minuman Teh & Kopi',
    'Minuman Energi',
    'Gas Elpiji',
];

export default function Edit({ product }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_produk: product.nama_produk,
        kategori: product.kategori || KATEGORI_OPTIONS[0],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="page-header">
                    Edit Produk
                </h2>
            }
        >
            <Head title="Edit Produk" />

            <div className="mx-auto max-w-2xl space-y-6"><div className="card"><div className="p-6">
                        <form onSubmit={submit} className="space-y-6">
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
                                    {KATEGORI_OPTIONS.map((k) => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                                <InputError message={errors.kategori} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('products.index')}
                                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Batal
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Perbarui
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
