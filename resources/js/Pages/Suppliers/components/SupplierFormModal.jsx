import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

const SKOR_OPTIONS = [
    { value: 5, label: '★★★★★ Sangat Baik' },
    { value: 4, label: '★★★★☆ Baik' },
    { value: 3, label: '★★★☆☆ Biasa' },
    { value: 2, label: '★★☆☆☆ Buruk' },
    { value: 1, label: '★☆☆☆☆ Sangat Buruk' },
];

export default function SupplierFormModal({ showModal, closeModal, editingSupplier, criteria }) {
    const getInitialData = () => {
        const initialData = {
            nama_supplier: '',
            potongan_tunai: '',
        };
        criteria.forEach((c) => {
            initialData['criteria_' + c.id] = '';
        });
        return initialData;
    };

    const { data, setData, post, put, processing, errors, reset } = useForm(getInitialData());

    useEffect(() => {
        if (editingSupplier) {
            const formData = {
                nama_supplier:  editingSupplier.nama_supplier || '',
                potongan_tunai: editingSupplier.potongan_tunai || '',
            };
            criteria.forEach((c) => {
                const fieldName = 'criteria_' + c.id;
                const value = editingSupplier[fieldName];
                if (value !== null && value !== undefined) {
                    if (c.tipe === 'benefit') {
                        formData[fieldName] = String(Math.round(Number.parseFloat(value)));
                    } else {
                        formData[fieldName] = Number.parseFloat(value);
                    }
                } else {
                    formData[fieldName] = '';
                }
            });
            setData(formData);
        } else {
            reset();
        }
    }, [editingSupplier, criteria]);

    const submit = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    return (
        <Modal show={showModal} onClose={closeModal} maxWidth="2xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {editingSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
                </h2>

                <div className="mt-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-800">
                            Informasi Supplier
                        </h3>
                        
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
                        <div>
                            <InputLabel htmlFor="potongan_tunai" value="Informasi Potongan Tunai" />
                            <TextInput
                                id="potongan_tunai"
                                value={data.potongan_tunai}
                                className="mt-1 block w-full"
                                placeholder="Contoh: 2% untuk pembelian di atas Rp 500.000"
                                onChange={(e) => setData('potongan_tunai', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-400">Informasi referensi, tidak digunakan dalam perhitungan SPK.</p>
                            <InputError message={errors.potongan_tunai} className="mt-2" />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-md font-semibold text-gray-800">
                            Kriteria Supplier
                        </h3>
                        <p className="text-sm text-navy-500">
                            Informasi kriteria yang berlaku untuk semua produk dari supplier ini.
                        </p>
                        
                        {criteria.map((c) => {
                            const fieldName = 'criteria_' + c.id;
                            let optionsToUse = null;
                            if (c.options && Array.isArray(c.options) && c.options.length === 5 && c.options.some(opt => opt && opt.trim() !== '')) {
                                optionsToUse = [
                                    { value: 5, label: c.options[0] },
                                    { value: 4, label: c.options[1] },
                                    { value: 3, label: c.options[2] },
                                    { value: 2, label: c.options[3] },
                                    { value: 1, label: c.options[4] },
                                ];
                            } else {
                                optionsToUse = SKOR_OPTIONS;
                            }
                            
                            if (c.tipe === 'benefit') {
                                return (
                                    <div key={c.id}>
                                        <InputLabel htmlFor={fieldName} value={c.nama_kriteria} />
                                        <select
                                            id={fieldName}
                                            value={data[fieldName]}
                                            className="mt-1 block w-full rounded-md border-navy-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            onChange={(e) => setData(fieldName, e.target.value)}
                                        >
                                            <option value="">— Pilih Skor —</option>
                                            {optionsToUse.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors[fieldName]} className="mt-2" />
                                    </div>
                                );
                            }
                            
                            if (c.tipe === 'cost') {
                                const hasUnit = c.satuan && c.satuan.trim() !== '';
                                
                                return (
                                    <div key={c.id}>
                                        <InputLabel 
                                            htmlFor={fieldName} 
                                            value={c.nama_kriteria + (hasUnit ? ' (dalam ' + c.satuan + ')' : '')} 
                                        />
                                        <TextInput
                                            id={fieldName}
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={data[fieldName]}
                                            className="mt-1 block w-full"
                                            placeholder={hasUnit ? `Contoh: 5` : 'Nilai'}
                                            onChange={(e) => setData(fieldName, e.target.value)}
                                        />
                                        {hasUnit && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                Nilai kriteria ini diukur dalam satuan {c.satuan}.
                                            </p>
                                        )}
                                        <InputError message={errors[fieldName]} className="mt-2" />
                                    </div>
                                );
                            }
                            
                            return (
                                <div key={c.id}>
                                    <InputLabel htmlFor={fieldName} value={c.nama_kriteria} />
                                    <TextInput
                                        id={fieldName}
                                        type="number"
                                        step="1"
                                        min="1"
                                        max="5"
                                        value={data[fieldName]}
                                        className="mt-1 block w-full"
                                        placeholder="1-5"
                                        onChange={(e) => setData(fieldName, e.target.value)}
                                    />
                                    <InputError message={errors[fieldName]} className="mt-2" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={closeModal}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {editingSupplier ? 'Perbarui' : 'Simpan'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
