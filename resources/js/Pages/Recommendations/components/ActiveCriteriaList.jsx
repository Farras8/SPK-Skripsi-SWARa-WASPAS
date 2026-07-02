import React from 'react';

export default function ActiveCriteriaList({ criteria }) {
    const activeCriteria = criteria.filter((c) => c.bobot_swara && parseFloat(c.bobot_swara) > 0);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    Prioritas Kriteria Saat Ini
                </h3>
            </div>
            <div className="p-6">
                {activeCriteria.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {activeCriteria.map((c, i) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2"
                            >
                                <span className="text-xs font-semibold text-primary-600">
                                    {i + 1}.
                                </span>
                                <span className="text-sm font-medium text-navy-700">
                                    {c.nama_kriteria}
                                </span>
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                                    {(parseFloat(c.bobot_swara) * 100).toFixed(1)}%
                                </span>
                                <span className={`rounded-full px-1.5 py-0.5 text-xs ${c.tipe === 'cost'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                    {c.tipe === 'cost' ? 'Cost' : 'Benefit'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-amber-600">
                        ⚠ Bobot SWARA belum diatur. Silakan atur di halaman Pembobotan Kriteria terlebih dahulu.
                    </p>
                )}
            </div>
        </div>
    );
}
