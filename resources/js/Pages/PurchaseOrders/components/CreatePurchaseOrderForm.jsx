import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');

const emptyItem = () => ({ product_id: '', nama_barang: '', jumlah: 1, harga_satuan: '', diskon_persen: '', diskon_satuan: '', tanggal_kadaluarsa: '' });

const getInitialDiscountPercent = (potonganText, hargaSatuan) => {
    if (!potonganText) return 0;
    
    const percentMatch = potonganText.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    if (percentMatch) {
        return parseFloat(percentMatch[1]) || 0;
    }
    
    const cleanText = potonganText.replace(/[^0-9]/g, '');
    const num = parseFloat(cleanText);
    if (!isNaN(num) && num > 0 && hargaSatuan) {
        return Math.round((num / parseFloat(hargaSatuan)) * 100);
    }
    
    return 0;
};

export default function CreatePurchaseOrderForm({ suppliers, products, supplierProducts, defaultSupplierId, defaultProductId, nomorPo, onClose }) {
    const defaultProductPriceRaw = supplierProducts?.find(sp => sp.supplier_id == defaultSupplierId && sp.product_id == defaultProductId)?.harga_satuan || '';
    const defaultProductPrice = defaultProductPriceRaw ? Math.round(parseFloat(defaultProductPriceRaw)) : '';
    const defaultProductName = products?.find(p => p.id == defaultProductId)?.nama_produk || '';

    const initialSupplier = suppliers?.find(s => s.id == defaultSupplierId);
    const initialPct = defaultSupplierId && defaultProductId
        ? getInitialDiscountPercent(initialSupplier?.potongan_tunai, defaultProductPrice)
        : '';
    const initialNominal = initialPct && defaultProductPrice
        ? Math.round((parseFloat(defaultProductPrice) * initialPct) / 100)
        : '';

    const initialItem = (defaultSupplierId && defaultProductId) 
        ? { product_id: defaultProductId, nama_barang: defaultProductName, jumlah: 1, harga_satuan: defaultProductPrice, diskon_persen: initialPct, diskon_satuan: initialNominal, tanggal_kadaluarsa: '' }
        : emptyItem();

    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id:  defaultSupplierId ?? '',
        tanggal_po:   new Date().toISOString().split('T')[0],
        keterangan:   '',
        items:        [initialItem],
    });

    const availableSupplierProducts = supplierProducts?.filter(sp => sp.supplier_id == data.supplier_id) || [];

    const selectedSupplier = suppliers?.find(s => s.id == data.supplier_id);

    const addItem = () => setData('items', [...data.items, emptyItem()]);

    const removeItem = (idx) =>
        setData('items', data.items.filter((_, i) => i !== idx));

    const updateItem = (idx, field, value) => {
        const items = data.items.map((item, i) => {
            if (i === idx) {
                const updated = { ...item, [field]: value };
                if (field === 'harga_satuan') {
                    const pct = parseFloat(item.diskon_persen) || 0;
                    updated.diskon_satuan = Math.round((parseFloat(value) * pct) / 100);
                } else if (field === 'diskon_persen') {
                    const price = parseFloat(item.harga_satuan) || 0;
                    updated.diskon_satuan = Math.round((price * (parseFloat(value) || 0)) / 100);
                }
                return updated;
            }
            return item;
        });
        setData('items', items);
    };

    const hargaBersih = (item) => {
        const satuan = parseFloat(item.harga_satuan) || 0;
        const diskon = parseFloat(item.diskon_satuan) || 0;
        return Math.max(0, satuan - diskon);
    };

    const total = data.items.reduce(
        (sum, i) => sum + (parseFloat(i.jumlah) || 0) * hargaBersih(i),
        0
    );

    const totalJumlah = data.items.reduce(
        (sum, i) => sum + (parseInt(i.jumlah) || 0),
        0
    );

    const minOrder = selectedSupplier?.minimal_order || 0;
    const isMinOrderUnmet = minOrder > 0 && totalJumlah < minOrder;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchase-orders.store'), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold text-navy-900">Buat Purchase Order Baru</h2>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form id="create-po-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-navy-800 border-b border-gray-200 pb-2">
                            📋 Informasi Purchase Order
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Nomor PO" />
                                <TextInput value={nomorPo} disabled className="mt-1 block w-full bg-gray-50 text-gray-500 font-mono" />
                            </div>
                            <div>
                                <InputLabel value="Tanggal PO" required />
                                <TextInput
                                    type="date"
                                    value={data.tanggal_po}
                                    onChange={e => setData('tanggal_po', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.tanggal_po} className="mt-1" />
                            </div>
                        </div>

                        <div className="gap-4">
                            <div>
                                <InputLabel value="Supplier" required />
                                <select
                                    value={data.supplier_id}
                                    onChange={e => {
                                        setData(d => ({
                                            ...d,
                                            supplier_id: e.target.value,
                                            items: [emptyItem()],
                                        }));
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                >
                                    <option value="">— Pilih Supplier —</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                    ))}
                                </select>
                                <InputError message={errors.supplier_id} className="mt-1" />
                            </div>
                        </div>

                        {selectedSupplier && (selectedSupplier.potongan_tunai || selectedSupplier.minimal_order > 0) && (
                            <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 space-y-1">
                                {selectedSupplier.potongan_tunai && (
                                    <div>
                                        💡 Info Potongan Tunai dari <strong>{selectedSupplier.nama_supplier}</strong>: {selectedSupplier.potongan_tunai}
                                    </div>
                                )}
                                {selectedSupplier.minimal_order > 0 && (
                                    <div>
                                        📦 Batas Minimal Order: <strong>{selectedSupplier.minimal_order} unit</strong> (Saat ini diinput: <strong>{totalJumlah} unit</strong>)
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <InputLabel value="Keterangan" />
                            <textarea
                                value={data.keterangan}
                                onChange={e => setData('keterangan', e.target.value)}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                placeholder="Catatan PO (opsional)..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <h3 className="text-base font-semibold text-navy-800">📦 Daftar Barang</h3>
                            <button type="button" onClick={addItem}
                                className="rounded-md bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-100">
                                + Tambah Baris
                            </button>
                        </div>

                        {errors.items && (
                            <p className="text-sm text-red-600">{errors.items}</p>
                        )}

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[240px]">Nama Barang</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Jumlah</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Harga Asli</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Potongan (%)</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Potongan (Rp)</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Harga Bersih</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Tgl Kadaluarsa</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Subtotal</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-3 py-2">
                                                {data.supplier_id ? (
                                                    <select
                                                        value={item.product_id || ''}
                                                        onChange={e => {
                                                            const pId = e.target.value;
                                                            const sp = availableSupplierProducts.find(s => s.product_id == pId);
                                                            const items = [...data.items];
                                                            if (sp) {
                                                                const price = sp.harga_satuan ? Math.round(parseFloat(sp.harga_satuan)) : '';
                                                                const pct = getInitialDiscountPercent(selectedSupplier?.potongan_tunai, price);
                                                                const nominal = Math.round((price * pct) / 100);
                                                                items[idx] = { 
                                                                    ...items[idx], 
                                                                    product_id: pId, 
                                                                    nama_barang: sp.nama_produk, 
                                                                    harga_satuan: price,
                                                                    diskon_persen: pct,
                                                                    diskon_satuan: nominal
                                                                };
                                                            } else {
                                                                items[idx] = { ...items[idx], product_id: '', nama_barang: '', harga_satuan: '', diskon_persen: '', diskon_satuan: '' };
                                                            }
                                                            setData('items', items);
                                                        }}
                                                        className="block w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 min-w-[220px]"
                                                        required
                                                    >
                                                        <option value="">— Pilih Barang —</option>
                                                        {availableSupplierProducts.map(sp => (
                                                            <option key={sp.product_id} value={sp.product_id}>{sp.nama_produk}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={item.nama_barang}
                                                        onChange={e => updateItem(idx, 'nama_barang', e.target.value)}
                                                        className="block w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-100 min-w-[220px]"
                                                        placeholder="Pilih Supplier dulu..."
                                                        disabled
                                                        required
                                                    />
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.jumlah}
                                                    onChange={e => updateItem(idx, 'jumlah', e.target.value)}
                                                    className="block w-full rounded border-gray-300 text-center text-sm focus:border-primary-500 focus:ring-primary-500 min-w-[70px]"
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.harga_satuan}
                                                    onChange={e => updateItem(idx, 'harga_satuan', e.target.value)}
                                                    className="block w-full rounded border-gray-300 text-right text-sm focus:border-primary-500 focus:ring-primary-500 min-w-[120px]"
                                                    placeholder="0"
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={item.diskon_persen}
                                                    onChange={e => updateItem(idx, 'diskon_persen', e.target.value)}
                                                    className="block w-full rounded border-gray-300 text-right text-sm focus:border-primary-500 focus:ring-primary-500 bg-blue-50 min-w-[80px]"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={item.diskon_satuan}
                                                    disabled
                                                    className="block w-full rounded border-gray-300 text-right text-sm bg-gray-50 text-gray-500 min-w-[110px]"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right text-sm font-medium text-green-700">
                                                {fmt(hargaBersih(item))}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="date"
                                                    value={item.tanggal_kadaluarsa}
                                                    onChange={e => updateItem(idx, 'tanggal_kadaluarsa', e.target.value)}
                                                    className="block w-full rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 min-w-[130px]"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-right text-sm font-medium text-navy-800">
                                                {fmt((parseFloat(item.jumlah) || 0) * hargaBersih(item))}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {data.items.length > 1 && (
                                                    <button type="button" onClick={() => removeItem(idx)}
                                                        className="text-red-400 hover:text-red-600 text-xl leading-none font-bold"
                                                        title="Hapus baris">
                                                        ×
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-navy-50">
                                        <td colSpan={7} className="px-4 py-3 text-right text-sm font-semibold text-navy-800">
                                            Total Harga PO (setelah potongan):
                                        </td>
                                        <td className="px-4 py-3 text-right text-base font-bold text-primary-700">
                                            {fmt(total)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {isMinOrderUnmet && (
                            <div className="mt-3 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
                                ⚠️ <span>Total pemesanan saat ini (<strong>{totalJumlah} unit</strong>) kurang dari batas minimal order supplier (<strong>{minOrder} unit</strong>).</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-lg shrink-0">
                <SecondaryButton type="button" onClick={onClose}>Batal</SecondaryButton>
                <PrimaryButton form="create-po-form" type="submit" disabled={processing || isMinOrderUnmet}>
                    {processing ? 'Menyimpan...' : '💾 Simpan PO'}
                </PrimaryButton>
            </div>
        </div>
    );
}
