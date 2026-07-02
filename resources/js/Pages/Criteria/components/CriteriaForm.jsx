import React from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function CriteriaForm({ tipeOptions, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_kriteria: '',
        tipe: 'cost',
        kategori: 'product',
        options: ['', '', '', '', ''],
        satuan: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('criteria.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-medium text-navy-900 mb-6">Tambah Kriteria Baru</h2>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="nama_kriteria" value="Nama Kriteria" />
                    <TextInput
                        id="nama_kriteria"
                        value={data.nama_kriteria}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('nama_kriteria', e.target.value)}
                    />
                    <InputError message={errors.nama_kriteria} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="kategori" value="Kategori" />
                    <select
                        id="kategori"
                        value={data.kategori}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        onChange={(e) => setData('kategori', e.target.value)}
                    >
                        <option value="product">Produk</option>
                        <option value="supplier">Supplier</option>
                    </select>
                    <InputError message={errors.kategori} className="mt-1" />
                </div>
                <div>
                    <InputLabel htmlFor="tipe" value="Tipe" />
                    <select
                        id="tipe"
                        value={data.tipe}
                        className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        onChange={(e) => {
                            const val = e.target.value;
                            setData({
                                ...data,
                                tipe: val,
                                satuan: val === 'benefit' ? '' : data.satuan
                            });
                        }}
                    >
                        {tipeOptions.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    <InputError message={errors.tipe} className="mt-1" />
                </div>
                {data.tipe === 'cost' && (
                    <div>
                        <InputLabel htmlFor="satuan" value="Satuan (Opsional)" />
                        <TextInput
                            id="satuan"
                            value={data.satuan}
                            className="mt-1 block w-full"
                            placeholder="Contoh: jam, kg, km, dll."
                            onChange={(e) => setData('satuan', e.target.value)}
                        />
                        <InputError message={errors.satuan} className="mt-1" />
                    </div>
                )}
                {data.tipe === 'benefit' && (
                    <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <InputLabel value="Label Skala Penilaian (1-5)" />
                        <p className="text-xs text-gray-500 mb-2">Masukkan label dari nilai tertinggi (5) ke nilai terendah (1).</p>
                        
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-600">5:</span>
                            <TextInput
                                value={data.options[0] || ''}
                                onChange={(e) => setData('options', [e.target.value, data.options[1], data.options[2], data.options[3], data.options[4]])}
                                className="w-full text-sm"
                                placeholder="Misal: Sangat Baik / > 10%"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-600">4:</span>
                            <TextInput
                                value={data.options[1] || ''}
                                onChange={(e) => setData('options', [data.options[0], e.target.value, data.options[2], data.options[3], data.options[4]])}
                                className="w-full text-sm"
                                placeholder="Misal: Baik / 7% - 10%"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-600">3:</span>
                            <TextInput
                                value={data.options[2] || ''}
                                onChange={(e) => setData('options', [data.options[0], data.options[1], e.target.value, data.options[3], data.options[4]])}
                                className="w-full text-sm"
                                placeholder="Misal: Cukup / 4% - 6%"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-600">2:</span>
                            <TextInput
                                value={data.options[3] || ''}
                                onChange={(e) => setData('options', [data.options[0], data.options[1], data.options[2], e.target.value, data.options[4]])}
                                className="w-full text-sm"
                                placeholder="Misal: Buruk / 1% - 3%"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 text-center font-bold text-gray-600">1:</span>
                            <TextInput
                                value={data.options[4] || ''}
                                onChange={(e) => setData('options', [data.options[0], data.options[1], data.options[2], data.options[3], e.target.value])}
                                className="w-full text-sm"
                                placeholder="Misal: Sangat Buruk / 0%"
                                required
                            />
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Batal
                    </button>
                    <PrimaryButton disabled={processing}>Simpan Kriteria</PrimaryButton>
                </div>
            </form>
        </div>
    );
}
