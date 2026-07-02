import React from 'react';

export default function CalculationDetails({ calculationDetails, activeCriteria, supplierMap }) {
    if (!calculationDetails) return null;

    return (
        <div className="space-y-6">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        📊 Detail Perhitungan WASPAS (Super Admin)
                    </h3>
                    <p className="mt-1 text-sm text-navy-600">
                        Tampilan lengkap proses perhitungan dari matriks awal hingga ranking akhir
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-navy-800 mb-3">
                            1️⃣ Matriks Keputusan Awal
                        </h4>
                        <p className="text-sm text-navy-600 mb-3">
                            Nilai kriteria asli untuk setiap supplier
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        {activeCriteria.map((c) => (
                                            <th key={c.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                                {c.nama_kriteria}
                                                <br />
                                                <span className={`text-xs ${c.tipe === 'cost' ? 'text-red-500' : 'text-green-500'}`}>
                                                    ({c.tipe === 'cost' ? 'Cost' : 'Benefit'})
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {Object.entries(calculationDetails.matrix).map(([supplierId, row]) => (
                                        <tr key={supplierId}>
                                            <td className="px-4 py-3 text-sm font-medium text-navy-900 whitespace-nowrap">
                                                {supplierMap[supplierId]}
                                            </td>
                                            {activeCriteria.map((c) => (
                                                <td key={c.id} className="px-4 py-3 text-center text-sm text-navy-700">
                                                    {row[c.id]?.toFixed(2) || '0.00'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-navy-800 mb-3">
                            2️⃣ Matriks Ternormalisasi
                        </h4>
                        <p className="text-sm text-navy-600 mb-2">
                            Normalisasi menggunakan formula:
                        </p>
                        <div className="bg-navy-50 border-l-4 border-primary-500 p-3 mb-3 space-y-1">
                            <p className="text-sm font-mono text-navy-800">
                                <strong>Benefit:</strong> rij = xij / max(xij)
                            </p>
                            <p className="text-sm font-mono text-navy-800">
                                <strong>Cost:</strong> rij = min(xij) / xij
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        {activeCriteria.map((c) => (
                                            <th key={c.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                                {c.nama_kriteria}
                                                <br />
                                                <span className="text-xs text-navy-500">
                                                    {c.tipe === 'cost' 
                                                        ? `min=${calculationDetails.minMax[c.id]?.min?.toFixed(2)}`
                                                        : `max=${calculationDetails.minMax[c.id]?.max?.toFixed(2)}`
                                                    }
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {Object.entries(calculationDetails.normalized).map(([supplierId, row]) => (
                                        <tr key={supplierId}>
                                            <td className="px-4 py-3 text-sm font-medium text-navy-900 whitespace-nowrap">
                                                {supplierMap[supplierId]}
                                            </td>
                                            {activeCriteria.map((c) => (
                                                <td key={c.id} className="px-4 py-3 text-center text-sm text-navy-700">
                                                    {row[c.id]?.toFixed(4) || '0.0000'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-navy-800 mb-3">
                            3️⃣ Perhitungan Weighted Sum Method (Q)
                        </h4>
                        <p className="text-sm text-navy-600 mb-2">
                            Q = Σ (rij × wj)
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        {activeCriteria.map((c) => (
                                            <th key={c.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                                {c.nama_kriteria}
                                                <br />
                                                <span className="text-xs text-navy-500">
                                                    w={parseFloat(c.bobot_swara).toFixed(4)}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider bg-primary-100">
                                            Total Q
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {calculationDetails.details.map((detail) => (
                                        <tr key={detail.supplier_id}>
                                            <td className="px-4 py-3 text-sm font-medium text-navy-900 whitespace-nowrap">
                                                {detail.nama_supplier}
                                            </td>
                                            {detail.criterion_breakdown.map((cb) => (
                                                <td key={cb.criteria_id} className="px-4 py-3 text-center text-sm text-navy-700">
                                                    {cb.wsm_component.toFixed(4)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center text-sm font-bold text-primary-700 bg-primary-50">
                                                {detail.wsm.toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-navy-800 mb-3">
                            4️⃣ Perhitungan Weighted Product Method (P)
                        </h4>
                        <p className="text-sm text-navy-600 mb-2">
                            P = Π (rij ^ wj)
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        {activeCriteria.map((c) => (
                                            <th key={c.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                                {c.nama_kriteria}
                                                <br />
                                                <span className="text-xs text-navy-500">
                                                    ^{parseFloat(c.bobot_swara).toFixed(4)}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider bg-primary-100">
                                            Total P
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {calculationDetails.details.map((detail) => (
                                        <tr key={detail.supplier_id}>
                                            <td className="px-4 py-3 text-sm font-medium text-navy-900 whitespace-nowrap">
                                                {detail.nama_supplier}
                                            </td>
                                            {detail.criterion_breakdown.map((cb) => (
                                                <td key={cb.criteria_id} className="px-4 py-3 text-center text-sm text-navy-700">
                                                    {cb.wpm_component !== null ? cb.wpm_component.toFixed(4) : '0.0000'}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center text-sm font-bold text-primary-700 bg-primary-50">
                                                {detail.wpm.toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-navy-800 mb-3">
                            5️⃣ Skor Akhir WASPAS (Qi)
                        </h4>
                        <p className="text-sm text-navy-600 mb-2">
                            Formula: Qi = λ × Q + (1 - λ) × P, dengan λ = {calculationDetails.lambda}
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Q (WSM)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            P (WPM)
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider bg-primary-100">
                                            Qi = {calculationDetails.lambda} × Q + {(1 - calculationDetails.lambda).toFixed(1)} × P
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                            Ranking
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {[...calculationDetails.details]
                                        .sort((a, b) => b.qi - a.qi)
                                        .map((detail, index) => (
                                            <tr key={detail.supplier_id} className={index === 0 ? 'bg-amber-50' : ''}>
                                                <td className="px-6 py-3 text-sm font-medium text-navy-900 whitespace-nowrap">
                                                    {detail.nama_supplier}
                                                </td>
                                                <td className="px-6 py-3 text-center text-sm text-navy-700">
                                                    {detail.wsm.toFixed(4)}
                                                </td>
                                                <td className="px-6 py-3 text-center text-sm text-navy-700">
                                                    {detail.wpm.toFixed(4)}
                                                </td>
                                                <td className="px-6 py-3 text-center text-sm font-bold text-primary-700 bg-primary-50">
                                                    {detail.qi.toFixed(4)}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        index === 0
                                                            ? 'bg-amber-200 text-amber-900'
                                                            : 'bg-navy-100 text-navy-700'
                                                    }`}>
                                                        {index === 0 ? '🏆 #1' : `#${index + 1}`}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <h5 className="font-semibold text-primary-800 mb-2">
                            ℹ️ Penjelasan Rumus
                        </h5>
                        <ul className="space-y-1 text-sm text-primary-700">
                            <li><strong>Normalisasi:</strong> Mengubah skala nilai agar dapat dibandingkan (0-1)</li>
                            <li><strong>WSM (Q):</strong> Menjumlahkan nilai ternormalisasi × bobot setiap kriteria</li>
                            <li><strong>WPM (P):</strong> Mengalikan nilai ternormalisasi dipangkatkan bobot</li>
                            <li><strong>WASPAS (Qi):</strong> Menggabungkan Q dan P dengan parameter λ (0.5 = bobot seimbang)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
