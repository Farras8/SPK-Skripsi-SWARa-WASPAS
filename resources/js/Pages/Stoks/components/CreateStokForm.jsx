import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateStokForm({ onClose, products, stoks }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        nama_barang: '',
        jumlah: '',
        harga_jual: '',
        harga_beli: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_kadaluarsa: '',
        keterangan: '',
    });

    const [inputMode, setInputMode] = useState('pilih');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('stoks.store'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    const handlePilihProduk = (e) => {
        const id = e.target.value;
        const produk = products.find(p => p.id === parseInt(id));
        const existingStok = stoks?.find(s => s.product_id === parseInt(id) && s.harga_jual !== null);
        setData(d => ({
            ...d,
            product_id: id,
            nama_barang: produk ? produk.nama_produk : '',
            harga_jual: existingStok ? existingStok.harga_jual : '',
            harga_beli: existingStok?.harga_beli ?? '',
        }));
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-navy-900 mb-6">Tambah Stok Barang</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Nama Barang</label>
                    <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => { setInputMode('pilih'); setData(d => ({ ...d, product_id: '', nama_barang: '' })); }}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${inputMode === 'pilih' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            Pilih Produk
                        </button>
                        <button type="button" onClick={() => { setInputMode('baru'); setData(d => ({ ...d, product_id: '', nama_barang: '' })); }}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${inputMode === 'baru' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            + Nama Baru
                        </button>
                    </div>
                    {inputMode === 'pilih' ? (
                        <select
                            value={data.product_id}
                            onChange={handlePilihProduk}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                        >
                            <option value="">— Pilih Produk —</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.nama_produk}{p.kategori ? ` (${p.kategori})` : ''}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={data.nama_barang}
                            onChange={(e) => setData('nama_barang', e.target.value)}
                            placeholder="Ketik nama barang baru..."
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                            autoFocus
                        />
                    )}
                    {errors.nama_barang && <p className="mt-1 text-sm text-red-600">{errors.nama_barang}</p>}
                    {inputMode === 'baru' && (
                        <p className="mt-1 text-xs text-gray-500">Produk baru akan otomatis terdaftar di master produk.</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-navy-700">Jumlah</label>
                    <input
                        type="number"
                        min="1"
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

                {data.harga_beli && data.harga_jual && (
                    <div className={`rounded-md p-2 text-sm ${parseFloat(data.harga_jual) >= parseFloat(data.harga_beli) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        Margin: Rp {Math.round(parseFloat(data.harga_jual) - parseFloat(data.harga_beli)).toLocaleString('id-ID')}
                        {' '}({parseFloat(data.harga_beli) > 0 ? (((parseFloat(data.harga_jual) - parseFloat(data.harga_beli)) / parseFloat(data.harga_beli)) * 100).toFixed(1) : '0'}%)
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
                        placeholder="Batch number, catatan, dll."
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
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
