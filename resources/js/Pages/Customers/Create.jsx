import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nama_customer: '',
        alamat: '',
        no_hp: '',
        plafon_kasbon: 200000,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Link href={route('customers.index')} className="text-sm text-primary-600 hover:text-primary-800">
                        ← Kembali
                    </Link>
                    <h2 className="page-header">Tambah Customer</h2>
                </div>
            }
        >
            <Head title="Tambah Customer" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="card">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy-700">Nama Customer</label>
                                <input
                                    type="text"
                                    value={data.nama_customer}
                                    onChange={(e) => setData('nama_customer', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.nama_customer && <p className="mt-1 text-sm text-red-600">{errors.nama_customer}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy-700">Alamat</label>
                                <input
                                    type="text"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.alamat && <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy-700">No. HP</label>
                                <input
                                    type="text"
                                    value={data.no_hp}
                                    onChange={(e) => setData('no_hp', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.no_hp && <p className="mt-1 text-sm text-red-600">{errors.no_hp}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy-700">Plafon Kasbon (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.plafon_kasbon}
                                    onChange={(e) => setData('plafon_kasbon', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                {errors.plafon_kasbon && <p className="mt-1 text-sm text-red-600">{errors.plafon_kasbon}</p>}
                            </div>

                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
