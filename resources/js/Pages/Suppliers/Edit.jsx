import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const PELAYANAN_OPTIONS = [
    { value: 5, label: 'Sangat Bagus' },
    { value: 4, label: 'Bagus' },
    { value: 3, label: 'Biasa Saja' },
    { value: 2, label: 'Buruk' },
    { value: 1, label: 'Sangat Buruk' },
];

export default function Edit({ supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_supplier: supplier.nama_supplier,
        jam_kirim: supplier.jam_kirim || '',
        pelayanan: supplier.pelayanan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('suppliers.update', supplier.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="page-header">
                    Edit Supplier
                </h2>
            }
        >
            <Head title="Edit Supplier" />

            <div className="mx-auto max-w-2xl space-y-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="card">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-navy-800">
                                Informasi Supplier
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="nama_supplier" value="Nama Supplier" />
                                    <TextInput
                                        id="nama_supplier"
                                        value={data.nama_supplier}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('nama_supplier', e.target.value)}
                                    />
                                    <InputError message={errors.nama_supplier} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="p-6">
                            <h3 className="mb-1 text-lg font-semibold text-navy-800">
                                Detail Layanan
                            </h3>
                            <p className="mb-4 text-sm text-navy-600">
                                Informasi kecepatan pengiriman dan kualitas pelayanan supplier ini.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="jam_kirim" value="Kecepatan Pengiriman (dalam jam)" />
                                    <TextInput
                                        id="jam_kirim"
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={data.jam_kirim}
                                        className="mt-1 block w-full"
                                        placeholder="Contoh: 3.5"
                                        onChange={(e) => setData('jam_kirim', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-navy-500">
                                        Rata-rata waktu pengiriman barang dari supplier ini (dalam jam).
                                    </p>
                                    <InputError message={errors.jam_kirim} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="pelayanan" value="Kualitas Pelayanan" />
                                    <select
                                        id="pelayanan"
                                        value={data.pelayanan}
                                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        onChange={(e) => setData('pelayanan', e.target.value)}
                                    >
                                        <option value="">— Pilih Skor —</option>
                                        {PELAYANAN_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-navy-500">
                                        Penilaian kualitas pelayanan dan kemudahan retur dari supplier ini.
                                    </p>
                                    <InputError message={errors.pelayanan} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href={route('suppliers.index')}
                            className="rounded-md text-sm text-navy-600 underline hover:text-navy-900"
                        >
                            Batal
                        </Link>
                        <PrimaryButton disabled={processing}>
                            Perbarui
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
