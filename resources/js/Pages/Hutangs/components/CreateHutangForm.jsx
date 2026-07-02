import React from 'react';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateHutangForm({ customers, onClose }) {
    const queryParams = new URLSearchParams(window.location.search);
    const preselectedCustomerId = queryParams.get('customer_id') || '';

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: preselectedCustomerId,
        jumlah_hutang: '',
        tanggal_hutang: new Date().toISOString().split('T')[0],
        keterangan: '',
    });

    const selectedCustomer = customers.find((c) => c.id === parseInt(data.customer_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('hutangs.store'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-navy-900 mb-6">Catat Kasbon Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-navy-700">Customer</label>
                    <select
                        value={data.customer_id}
                        onChange={(e) => setData('customer_id', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                        <option value="">— Pilih Customer —</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id} disabled={!c.bisa_kasbon}>
                                {c.nama_customer}
                                {!c.bisa_kasbon ? ' (Tidak bisa kasbon)' : ` — Sisa: Rp ${parseInt(c.sisa_plafon).toLocaleString('id-ID')}`}
                            </option>
                        ))}
                    </select>
                    {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                </div>

                {selectedCustomer && (
                    <div className={`rounded-md p-3 ${selectedCustomer.bisa_kasbon ? 'bg-blue-50' : 'bg-red-50'}`}>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Plafon:</span>
                            <span className="font-medium">Rp {parseInt(selectedCustomer.plafon_kasbon).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hutang Aktif:</span>
                            <span className="font-medium text-red-600">Rp {parseInt(selectedCustomer.total_hutang_aktif).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                            <span className="text-gray-600">Sisa Plafon:</span>
                            <span className={selectedCustomer.sisa_plafon > 0 ? 'text-green-600' : 'text-red-600'}>
                                Rp {parseInt(selectedCustomer.sisa_plafon).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-navy-700">Jumlah Kasbon (Rp)</label>
                    <input
                        type="number"
                        min="1"
                        max={selectedCustomer?.sisa_plafon || ''}
                        value={data.jumlah_hutang}
                        onChange={(e) => setData('jumlah_hutang', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.jumlah_hutang && <p className="mt-1 text-sm text-red-600">{errors.jumlah_hutang}</p>}
                    {selectedCustomer && data.jumlah_hutang && parseFloat(data.jumlah_hutang) > selectedCustomer.sisa_plafon && (
                        <p className="mt-1 text-sm text-red-600">
                            ⚠ Melebihi sisa plafon (Rp {parseInt(selectedCustomer.sisa_plafon).toLocaleString('id-ID')})
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-navy-700">Tanggal</label>
                    <input
                        type="date"
                        value={data.tanggal_hutang}
                        onChange={(e) => setData('tanggal_hutang', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.tanggal_hutang && <p className="mt-1 text-sm text-red-600">{errors.tanggal_hutang}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-navy-700">Keterangan</label>
                    <textarea
                        value={data.keterangan}
                        onChange={(e) => setData('keterangan', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        rows={2}
                    />
                    {errors.keterangan && <p className="mt-1 text-sm text-red-600">{errors.keterangan}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Batal
                    </button>
                    <PrimaryButton disabled={processing || !selectedCustomer?.bisa_kasbon}>
                        {processing ? 'Menyimpan...' : 'Simpan Kasbon'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
