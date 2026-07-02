import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SearchableSelect from '@/Components/SearchableSelect';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

export default function CreateSalesForm({ products, customers, nomorNota, onClose }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id:       '',
        tanggal_jual:      new Date().toISOString().split('T')[0],
        jenis_pembayaran:  'tunai',
        keterangan:        '',
        items:             [],
    });

    const [selectedStokId, setSelectedStokId] = useState('');
    const [hargaSatuan, setHargaSatuan]       = useState('');
    const [jumlahBeli, setJumlahBeli]         = useState(1);

    const [showCreateCustomer, setShowCreateCustomer] = useState(false);
    const { data: customerData, setData: setCustomerData, post: postCustomer, processing: creatingCustomer, reset: resetCustomer, errors: customerErrors } = useForm({
        nama_customer: '',
        no_hp: '',
        alamat: '',
        plafon_kasbon: 500000,
    });

    useEffect(() => {
        if (flash?.new_customer_id) {
            setData('customer_id', flash.new_customer_id);
        }
    }, [flash, customers]);

    const handleCreateCustomer = (e) => {
        e.preventDefault();
        postCustomer(route('customers.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateCustomer(false);
                resetCustomer();
            }
        });
    };

    const selectedStok = products.find(p => p.id === Number.parseInt(selectedStokId));

    const addItem = () => {
        if (!selectedStokId || !hargaSatuan || jumlahBeli < 1) return;
        if (selectedStok && jumlahBeli > selectedStok.stok) {
            alert(`Stok tidak mencukupi. Tersedia: ${selectedStok.stok}`);
            return;
        }
        if (data.items.some(i => i.stok_id === Number.parseInt(selectedStokId))) {
            alert('Batch produk ini sudah ada di daftar. Hapus dulu lalu tambah ulang.');
            return;
        }
        setData('items', [...data.items, {
            stok_id:      Number.parseInt(selectedStokId),
            nama_barang:  selectedStok?.nama_produk ?? '',
            keterangan_batch: selectedStok ? `Exp: ${new Date(selectedStok.tanggal_kadaluarsa).toLocaleDateString('id-ID', { dateStyle: 'medium' })}` : '',
            jumlah:       jumlahBeli,
            harga_satuan: Number.parseFloat(hargaSatuan),
            stok_tersedia: selectedStok?.stok ?? 0,
        }]);
        setSelectedStokId('');
        setHargaSatuan('');
        setJumlahBeli(1);
    };

    const removeItem = (idx) =>
        setData('items', data.items.filter((_, i) => i !== idx));

    const total = data.items.reduce(
        (sum, i) => sum + i.jumlah * i.harga_satuan,
        0
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    const stokOptions = products
        .filter(p => !data.items.some(i => i.stok_id === p.id))
        .map(p => ({
            value: p.id,
            label: `${p.nama_produk}${p.kategori ? ` (${p.kategori})` : ''} — Exp: ${new Date(p.tanggal_kadaluarsa).toLocaleDateString('id-ID', { dateStyle: 'medium' })} — Stok: ${p.stok} (${fmt(p.harga_jual)})`,
        }));

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-navy-900">Catat Penjualan Baru</h2>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form id="create-sales-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Transaksi */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-navy-800 border-b border-gray-200 pb-2">
                            🧾 Informasi Transaksi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Nomor Nota" />
                                <TextInput value={nomorNota} disabled className="mt-1 block w-full bg-gray-50 text-gray-500 font-mono" />
                            </div>
                            <div>
                                <InputLabel value="Tanggal Penjualan" required />
                                <TextInput
                                    type="date"
                                    value={data.tanggal_jual}
                                    onChange={e => setData('tanggal_jual', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.tanggal_jual} className="mt-1" />
                            </div>
                        </div>

                        {/* Jenis Pembayaran */}
                        <div>
                            <InputLabel value="Jenis Pembayaran" required />
                            <div className="mt-2 flex gap-4">
                                {['tunai', 'kredit'].map((jp) => (
                                    <label key={jp} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="jenis_pembayaran"
                                            value={jp}
                                            checked={data.jenis_pembayaran === jp}
                                            onChange={() => {
                                                setData('jenis_pembayaran', jp);
                                                if (jp === 'tunai') setData('customer_id', '');
                                            }}
                                            className="text-primary-600"
                                        />
                                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            jp === 'tunai'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {jp === 'tunai' ? '💵 Tunai' : '📒 Kredit / Kasbon'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.jenis_pembayaran} className="mt-1" />
                        </div>

                        {/* Customer — wajib jika kredit */}
                        <div>
                            <InputLabel
                                value={data.jenis_pembayaran === 'kredit' ? 'Customer (Wajib untuk Kredit)' : 'Customer (Opsional)'}
                            />
                            <div className="flex gap-2 items-center mt-1">
                                <select
                                    value={data.customer_id}
                                    onChange={e => setData('customer_id', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                >
                                    <option value="">— Walk-in / Pilih Customer —</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nama_customer}
                                            {c.sisa_plafon !== undefined
                                                ? ` (Sisa Plafon: ${fmt(c.sisa_plafon)})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateCustomer(true)}
                                    className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition text-lg font-bold"
                                    title="Tambah Customer Baru"
                                >
                                    +
                                </button>
                            </div>
                            <InputError message={errors.customer_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Keterangan" />
                            <textarea
                                value={data.keterangan}
                                onChange={e => setData('keterangan', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                placeholder="Catatan transaksi (opsional)..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 pb-36">
                        <h3 className="text-base font-semibold text-navy-800 border-b border-gray-200 pb-2">
                            📦 Pilih Barang
                        </h3>

                        <div className="flex gap-3 items-end flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex-1 min-w-48">
                                <InputLabel value="Nama Barang" />
                                <SearchableSelect
                                    options={stokOptions}
                                    value={selectedStokId}
                                    onChange={(val) => {
                                        setSelectedStokId(val);
                                        const p = products.find(x => x.id === Number.parseInt(val));
                                        setHargaSatuan(p?.harga_jual ? p.harga_jual : '');
                                    }}
                                    placeholder="Cari atau pilih barang..."
                                    className="mt-1"
                                />
                                {selectedStok && selectedStok.stok === 0 && (
                                    <p className="mt-1 text-xs text-red-500">Stok habis.</p>
                                )}
                            </div>
                            <div className="w-24">
                                <InputLabel value="Jumlah" />
                                <input
                                    type="number"
                                    min={1}
                                    max={selectedStok?.stok ?? 9999}
                                    value={jumlahBeli}
                                    onChange={e => setJumlahBeli(Number.parseInt(e.target.value) || 1)}
                                    className="mt-1 block w-full rounded-md border-gray-300 text-center shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                />
                            </div>
                            <div className="w-40">
                                <InputLabel value="Harga Satuan (Rp)" />
                                <input
                                    type="number"
                                    min={0}
                                    value={hargaSatuan}
                                    onChange={e => setHargaSatuan(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm text-right"
                                    placeholder="0"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                disabled={!selectedStokId || !hargaSatuan || (selectedStok?.stok === 0)}
                                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40"
                            >
                                + Tambah
                            </button>
                        </div>

                        {errors.items && (
                            <p className="text-sm text-red-600">{errors.items}</p>
                        )}

                        {/* Daftar item yang sudah dipilih */}
                        {data.items.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Jumlah</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Harga Satuan</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Subtotal</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2.5 text-sm font-medium text-navy-900">
                                                    <div>{item.nama_barang}</div>
                                                    {item.keterangan_batch && (
                                                        <div className="text-xs font-normal text-gray-500">{item.keterangan_batch}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-center text-sm text-navy-700">{item.jumlah}</td>
                                                <td className="px-4 py-2.5 text-right text-sm text-navy-700">{fmt(item.harga_satuan)}</td>
                                                <td className="px-4 py-2.5 text-right text-sm font-semibold text-navy-900">
                                                    {fmt(item.jumlah * item.harga_satuan)}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <button type="button" onClick={() => removeItem(idx)}
                                                        className="text-red-400 hover:text-red-600 text-xl leading-none font-bold"
                                                        title="Hapus baris">
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-navy-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-navy-800">
                                                Total:
                                            </td>
                                            <td className="px-4 py-3 text-right text-base font-bold text-primary-700">
                                                {fmt(total)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {data.jenis_pembayaran === 'kredit' && total > 0 && (
                        <div className="rounded-md bg-orange-50 p-4 border border-orange-200">
                            <p className="text-sm font-semibold text-orange-800">
                                📒 Total Rp {Math.round(total).toLocaleString('id-ID')} akan dicatat sebagai hutang kasbon.
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                                Pastikan customer sudah dipilih dan memiliki plafon yang cukup.
                            </p>
                        </div>
                    )}
                </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-lg shrink-0">
                <SecondaryButton type="button" onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton form="create-sales-form" type="submit" disabled={processing || data.items.length === 0}>
                    {processing ? 'Menyimpan...' : '💾 Simpan Transaksi'}
                </PrimaryButton>
            </div>

            {/* Modal Quick Add Customer */}
            <Modal show={showCreateCustomer} onClose={() => setShowCreateCustomer(false)}>
                <form onSubmit={handleCreateCustomer} className="p-6">
                    <h2 className="mb-4 text-lg font-bold text-navy-900">Tambah Customer Baru</h2>
                    <p className="mb-4 text-sm text-gray-600">
                        Tambahkan customer baru langsung dari sini tanpa menutup transaksi penjualan.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="nama_customer" value="Nama Customer" />
                            <TextInput
                                id="nama_customer"
                                type="text"
                                className="mt-1 block w-full"
                                value={customerData.nama_customer}
                                onChange={e => setCustomerData('nama_customer', e.target.value)}
                                autoFocus
                            />
                            {customerErrors.nama_customer && <p className="mt-1 text-sm text-red-600">{customerErrors.nama_customer}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP / WhatsApp" />
                            <TextInput
                                id="no_hp"
                                type="text"
                                className="mt-1 block w-full"
                                value={customerData.no_hp}
                                onChange={e => setCustomerData('no_hp', e.target.value)}
                            />
                            {customerErrors.no_hp && <p className="mt-1 text-sm text-red-600">{customerErrors.no_hp}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="alamat" value="Alamat (opsional)" />
                            <TextInput
                                id="alamat"
                                type="text"
                                className="mt-1 block w-full"
                                value={customerData.alamat}
                                onChange={e => setCustomerData('alamat', e.target.value)}
                            />
                            {customerErrors.alamat && <p className="mt-1 text-sm text-red-600">{customerErrors.alamat}</p>}
                        </div>
                        <div>
                            <InputLabel htmlFor="plafon_kasbon" value="Default Limit Kasbon (Plafon)" />
                            <div className="flex items-center mt-1">
                                <span className="rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-gray-500">Rp</span>
                                <TextInput
                                    id="plafon_kasbon"
                                    type="number"
                                    className="block w-full rounded-l-none"
                                    value={customerData.plafon_kasbon}
                                    onChange={e => setCustomerData('plafon_kasbon', e.target.value)}
                                />
                            </div>
                            {customerErrors.plafon_kasbon && <p className="mt-1 text-sm text-red-600">{customerErrors.plafon_kasbon}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowCreateCustomer(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={creatingCustomer}>
                            {creatingCustomer ? 'Menyimpan...' : 'Simpan Customer'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
