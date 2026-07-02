import React from 'react';

export default function LaporanFilterForm({
    dari,
    sampai,
    formDari,
    setFormDari,
    formSampai,
    setFormSampai,
    onFilter,
    onExport,
    tab,
}) {
    return (
        <form onSubmit={onFilter} className="card p-4 sm:p-6 flex flex-wrap items-end gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
                <input
                    type="date"
                    value={formDari}
                    onChange={(e) => setFormDari(e.target.value)}
                    className="rounded-md border-gray-300 text-sm shadow-sm px-3 py-2 min-w-[140px] focus:border-primary-500 focus:ring-primary-500"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
                <input
                    type="date"
                    value={formSampai}
                    onChange={(e) => setFormSampai(e.target.value)}
                    className="rounded-md border-gray-300 text-sm shadow-sm px-3 py-2 min-w-[140px] focus:border-primary-500 focus:ring-primary-500"
                />
            </div>
            <div className="flex flex-wrap items-end gap-2">
                <button
                    type="submit"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                    🔍 Filter
                </button>
                <button
                    type="button"
                    onClick={onExport}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    📊 Export {tab === 'po' ? 'PO' : 'Penjualan'} (Excel)
                </button>
            </div>
            <p className="text-xs text-gray-500 self-end ml-auto">
                Periode: {new Date(dari).toLocaleDateString('id-ID')} — {new Date(sampai).toLocaleDateString('id-ID')}
            </p>
        </form>
    );
}
