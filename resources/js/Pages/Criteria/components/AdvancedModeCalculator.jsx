import React, { useState, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import PieChart from './PieChart';

const SJ_PRESET_OPTIONS = [
    { value: 0, label: 'Sama Penting' },
    { value: 0.25, label: 'Kurang Penting' },
    { value: 0.5, label: 'Cukup Kurang Penting' },
    { value: 0.75, label: 'Jauh Kurang Penting' },
    { value: 1.0, label: 'Sangat Kurang Penting' },
];

const VALID_SJ_VALUES = SJ_PRESET_OPTIONS.map((option) => option.value);

function normalizeSjValue(value) {
    const parsed = Number.parseFloat(value);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    return VALID_SJ_VALUES.reduce((closest, current) => (
        Math.abs(current - parsed) < Math.abs(closest - parsed) ? current : closest
    ), VALID_SJ_VALUES[0]);
}

export default function AdvancedModeCalculator({ criteria }) {
    const [sjValues, setSjValues] = useState(() => {
        const initial = {};
        criteria.forEach((c) => {
            initial[c.id] = c.nilai_sj !== null ? normalizeSjValue(c.nilai_sj) : 0;
        });
        return initial;
    });
    const [saving, setSaving] = useState(false);

    const handleSjChange = useCallback((id, value) => {
        setSjValues((prev) => ({ ...prev, [id]: normalizeSjValue(value) }));
    }, []);

    const calculated = useMemo(() => {
        const results = [];
        let prevQ = null;
        let totalQ = 0;

        criteria.forEach((c, index) => {
            const sj = index === 0 ? 0 : (sjValues[c.id] || 0);
            const kj = 1 + sj;
            const qj = index === 0 ? 1 : (prevQ / kj);

            results.push({ id: c.id, nama: c.nama_kriteria, sj, kj, qj, wj: 0 });
            prevQ = qj;
            totalQ += qj;
        });

        results.forEach((r) => {
            r.wj = totalQ > 0 ? r.qj / totalQ : 0;
        });

        return results;
    }, [criteria, sjValues]);

    const topCriterion = useMemo(() => {
        if (calculated.length === 0) return null;
        return calculated.reduce((max, c) => c.wj > max.wj ? c : max, calculated[0]);
    }, [calculated]);

    const pieData = useMemo(() =>
        calculated.map((c) => ({ label: c.nama, value: c.wj })),
    [calculated]);

    const handleSave = () => {
        setSaving(true);
        const weights = criteria.map((c, index) => ({
            id: c.id,
            nilai_sj: index === 0 ? null : normalizeSjValue(sjValues[c.id] || 0),
        }));

        router.post(route('criteria.saveWeights'), { weights }, {
            onFinish: () => setSaving(false),
        });
    };

    if (criteria.length === 0) return null;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Mode Lanjutan</h3>
                <p className="mt-1 text-sm text-navy-600">
                    Atur tingkat kepentingan setiap kriteria secara manual dibandingkan kriteria di atasnya.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        Kriteria
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        Prioritas Dibanding Atasnya
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs uppercase tracking-wider">
                                        Bobot (Pengaruh)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {criteria.map((c, index) => {
                                    const calc = calculated[index];
                                    const sjVal = sjValues[c.id] || 0;
                                    return (
                                        <tr key={c.id}>
                                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-navy-900">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {c.nama_kriteria}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {c.tipe === 'cost' ? 'Semakin kecil semakin baik' : 'Semakin besar semakin baik'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {index === 0 ? (
                                                    <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
                                                        Paling Penting
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={sjVal}
                                                        onChange={(e) => handleSjChange(c.id, e.target.value)}
                                                        className="block w-full rounded-md border-navy-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                                    >
                                                        {SJ_PRESET_OPTIONS.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-bold text-primary-600">
                                                        {(calc.wj * 100).toFixed(1)}%
                                                    </span>
                                                    <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-primary-500 transition-all duration-300"
                                                            style={{ width: `${calc.wj * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-sm font-semibold text-navy-700">Distribusi Bobot</h4>
                    <PieChart data={pieData} />
                    {topCriterion && (
                        <p className="text-center text-sm text-gray-600">
                            <strong className="text-primary-600">{topCriterion.nama}</strong> menjadi
                            faktor penentu utama ({(topCriterion.wj * 100).toFixed(1)}%) dalam memilih supplier.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
                <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan Bobot'}
                </PrimaryButton>
            </div>
        </div>
    );
}
