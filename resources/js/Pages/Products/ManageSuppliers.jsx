import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

const SKOR_OPTIONS = [
    { value: 5, label: '★★★★★ Sangat Baik' },
    { value: 4, label: '★★★★☆ Baik' },
    { value: 3, label: '★★★☆☆ Biasa' },
    { value: 2, label: '★★☆☆☆ Buruk' },
    { value: 1, label: '★☆☆☆☆ Sangat Buruk' },
];

const getCriteriaOptions = (c) => {
    if (c.options && Array.isArray(c.options) && c.options.length === 5 && c.options.some(opt => opt && opt.trim() !== '')) {
        return [
            { value: 5, label: c.options[0] },
            { value: 4, label: c.options[1] },
            { value: 3, label: c.options[2] },
            { value: 2, label: c.options[3] },
            { value: 1, label: c.options[4] },
        ];
    }
    return SKOR_OPTIONS;
};

export default function ManageSuppliers({ product, supplierData, criteria }) {
    const { flash } = usePage().props;

    const [rows, setRows] = useState(() =>
        supplierData.map((s) => {
            const row = {
                supplier_id: s.supplier_id,
                nama_supplier: s.nama_supplier,
                tersedia: s.tersedia,
            };
            criteria.forEach((c) => {
                row['criteria_' + c.id] = s['criteria_' + c.id] ?? '';
            });
            return row;
        })
    );
    const [saving, setSaving] = useState(false);

    const avgValues = useMemo(() => {
        const avgs = {};
        criteria.forEach((c) => {
            if (c.tipe === 'cost') {
                const fieldName = 'criteria_' + c.id;
                const available = rows.filter((r) => r.tersedia && r[fieldName]);
                if (available.length > 0) {
                    avgs[c.id] = available.reduce((sum, r) => sum + Number.parseFloat(r[fieldName] || 0), 0) / available.length;
                } else {
                    avgs[c.id] = 0;
                }
            }
        });
        return avgs;
    }, [rows, criteria]);

    const updateRow = useCallback((index, field, value) => {
        setRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }, []);

    const toggleTersedia = useCallback((index) => {
        setRows((prev) => {
            const next = [...prev];
            const toggled = !next[index].tersedia;
            const resetValues = {};
            criteria.forEach((c) => {
                resetValues['criteria_' + c.id] = '';
            });
            next[index] = {
                ...next[index],
                tersedia: toggled,
                ...(toggled ? {} : resetValues),
            };
            return next;
        });
    }, [criteria]);

    const isAboveAvg = (criteriaId, value) => {
        if (!value || !avgValues[criteriaId]) return false;
        return Number.parseFloat(value) > avgValues[criteriaId] * 1.1;
    };

    const handleSave = () => {
        setSaving(true);
        const suppliers = rows.map((r) => {
            const data = {
                supplier_id: r.supplier_id,
                tersedia: r.tersedia,
            };
            criteria.forEach((c) => {
                const fieldName = 'criteria_' + c.id;
                data[fieldName] = r.tersedia ? (Number.parseFloat(r[fieldName]) || null) : null;
            });
            return data;
        });

        router.post(route('products.save-suppliers', product.id), { suppliers }, {
            onFinish: () => setSaving(false),
        });
    };

    const tersediaCount = rows.filter((r) => r.tersedia).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('products.index')}
                            className="text-sm text-primary-600 hover:text-primary-800"
                        >
                            ← Kembali ke Data Produk
                        </Link>
                        <h2 className="page-header">
                            Atur Supplier — {product.nama_produk}
                        </h2>
                    </div>
                    <div>
                        <p className="text-sm text-navy-600">
                            {tersediaCount} dari {rows.length} supplier tersedia
                        </p>
                        {criteria.some(c => c.tipe === 'cost') && (
                            <div className="mt-1 text-xs text-navy-500">
                                {criteria
                                    .filter(c => c.tipe === 'cost' && avgValues[c.id] > 0)
                                    .map(c => (
                                        <div key={c.id}>
                                            Rata-rata {c.nama_kriteria}: {avgValues[c.id].toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Atur Supplier — ${product.nama_produk}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                <div className="card">
                    <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Nama Supplier
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Tersedia?
                                        </th>
                                        {criteria.map((c) => (
                                            <th key={c.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                {c.nama_kriteria}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {rows.map((row, index) => (
                                        <tr
                                            key={row.supplier_id}
                                            className={row.tersedia ? 'bg-white' : 'bg-navy-50 opacity-60'}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-navy-900">
                                                {row.nama_supplier}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={row.tersedia}
                                                    onChange={() => toggleTersedia(index)}
                                                    className="h-4 w-4 rounded border-navy-300 text-primary-600 focus:ring-primary-500"
                                                />
                                            </td>
                                            {criteria.map((c) => {
                                                const fieldName = 'criteria_' + c.id;
                                                const value = row[fieldName];
                                                
                                                if (!row.tersedia) {
                                                    return (
                                                        <td key={c.id} className="px-4 py-3">
                                                            <span className="text-sm text-navy-400">—</span>
                                                        </td>
                                                    );
                                                }
                                                

                                                if (c.tipe === 'benefit') {
                                                    const optionsToUse = getCriteriaOptions(c);
                                                    return (
                                                        <td key={c.id} className="px-4 py-3">
                                                            <select
                                                                value={value}
                                                                onChange={(e) => updateRow(index, fieldName, e.target.value)}
                                                                className="w-44 rounded-md border-navy-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                            >
                                                                <option value="">— Pilih —</option>
                                                                {optionsToUse.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    );
                                                }
                                                
                                        
                                                return (
                                                    <td key={c.id} className="px-4 py-3">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={value}
                                                                onChange={(e) => updateRow(index, fieldName, e.target.value)}
                                                                className={`w-32 rounded-md border text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                                                                    isAboveAvg(c.id, value)
                                                                        ? 'border-red-300 bg-red-50 text-red-700'
                                                                        : 'border-navy-300'
                                                                }`}
                                                                placeholder="Nilai"
                                                            />
                                                            {isAboveAvg(c.id, value) && (
                                                                <span className="ml-1 text-xs text-red-500" title="Nilai di atas rata-rata">
                                                                    ⚠
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                            <p className="text-xs text-navy-500">
                                ⚠ Nilai yang berwarna merah melebihi 10% dari rata-rata supplier lain (khusus kriteria Cost).
                            </p>
                            <PrimaryButton onClick={handleSave} disabled={saving}>
                                {saving ? 'Menyimpan...' : 'Simpan Semua'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }
