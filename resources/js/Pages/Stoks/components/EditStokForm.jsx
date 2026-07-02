import React from 'react';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function EditStokForm({ stok, onCancel }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_barang: stok.nama_barang,
        jumlah: stok.jumlah,
        harga_jual: stok.harga_jual || '',
        harga_beli: stok.harga_beli || '',
        tanggal_masuk: stok.tanggal_masuk.split('T')[0],
        tanggal_kadaluarsa: stok.tanggal_kadaluarsa.split('T')[0],
        keterangan: stok.keterangan || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('stoks.update', stok.id), {
            onSuccess: () => onCancel()
        });
    };

    const marginRp = data.harga_beli && data.harga_jual
        ? parseFloat(data.harga_jual) - parseFloat(data.harga_beli)
        : null;
    const marginPersen = marginRp !== null && parseFloat(data.harga_beli) > 0
        ? ((marginRp / parseFloat(data.harga_beli)) * 100).toFixed(1)
        : null;

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-navy-900 mb-6">Edit Stok</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-navy-700">Nama Barang</label>
                    <input
                        type="text"
                        value={data.nama_barang}
                        onChange={(e) => setData('nama_barang', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.nama_barang && <p className="mt-1 text-sm text-red-600">{errors.nama_barang}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-navy-700">Jumlah</label>
                    <input
                        type="number"
                        min="0"
                        value={data.jumlah}
                        onChange={(e) => setData('jumlah', e.target.value)}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.jumlah && <p className="mt-1 text-sm text-red-600">{errors.jumlah}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-700">Harga Beli (Rp)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.harga_beli}
                            onChange={(e) => setData('harga_beli', e.target.value)}
                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="Harga dari supplier"
                        />
                        {errors.harga_beli && <p className="mt-1 text-sm text-red-600">{errors.harga_beli}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-700">Harga Jual (Rp)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.harga_jual}
                            onChange={(e) => setData('harga_jual', e.target.value)}
                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        {errors.harga_jual && <p className="mt-1 text-sm text-red-600">{errors.harga_jual}</p>}
                    </div>
                </div>

                {marginRp !== null && (
                    <div className={`rounded-md p-2 text-sm ${marginRp >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        Margin: Rp {Math.round(marginRp).toLocaleString('id-ID')}
                        {marginPersen !== null && ` (${marginPersen}%)`}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-700">Tanggal Masuk</label>
                        <input
                            type="date"
                            value={data.tanggal_masuk}
                            onChange={(e) => setData('tanggal_masuk', e.target.value)}
                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        {errors.tanggal_masuk && <p className="mt-1 text-sm text-red-600">{errors.tanggal_masuk}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-navy-700">Tanggal Kadaluarsa</label>
                        <input
                            type="date"
                            value={data.tanggal_kadaluarsa}
                            onChange={(e) => setData('tanggal_kadaluarsa', e.target.value)}
                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        {errors.tanggal_kadaluarsa && <p className="mt-1 text-sm text-red-600">{errors.tanggal_kadaluarsa}</p>}
                    </div>
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
                        onClick={onCancel}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Batal
                    </button>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
