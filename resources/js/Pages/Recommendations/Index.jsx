import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import ProductSelector from './components/ProductSelector';
import ActiveCriteriaList from './components/ActiveCriteriaList';
import RankingTable from './components/RankingTable';
import CalculationDetails from './components/CalculationDetails';

const PELAYANAN_LABELS = {
    5: 'Sangat Baik',
    4: 'Baik',
    3: 'Biasa',
    2: 'Buruk',
    1: 'Sangat Buruk',
};

export default function Index({ products, criteria, rankings, selectedProductId, selectedProduct, error, calculationDetails }) {
    const { flash, auth } = usePage().props;
    const [productId, setProductId] = useState(selectedProductId || '');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        if (!productId) return;
        setLoading(true);
        router.get(
            route('recommendations.index'),
            { product_id: productId },
            {
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const isSuperAdmin = auth?.user?.role === 'super_admin';

    const activeCriteria = criteria.filter((c) => c.bobot_swara && parseFloat(c.bobot_swara) > 0);

    const supplierMap = rankings.reduce((acc, r) => {
        acc[r.supplier_id] = r.nama_supplier;
        return acc;
    }, {});

    const exportToExcel = () => {
        const productName = selectedProduct?.nama_produk ?? 'Produk';
        const workbook = XLSX.utils.book_new();

        const rankingData = rankings.map((r) => ({
            'Ranking': r.ranking,
            'Nama Supplier': r.nama_supplier,
            'Skor Akhir (Qi)': parseFloat(r.qi.toFixed(4)),
            'Harga Satuan (Rp)': r.harga_satuan ? parseInt(r.harga_satuan) : '',
            'Jam Kirim': r.jam_kirim ? Math.round(parseFloat(r.jam_kirim)) : '',
            'Pelayanan': r.pelayanan
                ? (PELAYANAN_LABELS[Math.round(parseFloat(r.pelayanan))] ?? Math.round(parseFloat(r.pelayanan)))
                : '',
            'Status': r.status,
        }));

        const rankingSheet = XLSX.utils.json_to_sheet(rankingData);
        XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Hasil Ranking');

        if (isSuperAdmin && calculationDetails) {
            const matrixData = Object.entries(calculationDetails.matrix).map(([supplierId, row]) => {
                const entry = { 'Supplier': supplierMap[supplierId] };
                activeCriteria.forEach((c) => {
                    entry[c.nama_kriteria] = row[c.id]?.toFixed(2) ?? '0.00';
                });
                return entry;
            });
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(matrixData), 'Matriks Awal');

            const normalizedData = Object.entries(calculationDetails.normalized).map(([supplierId, row]) => {
                const entry = { 'Supplier': supplierMap[supplierId] };
                activeCriteria.forEach((c) => {
                    entry[c.nama_kriteria] = row[c.id]?.toFixed(4) ?? '0.0000';
                });
                return entry;
            });
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(normalizedData), 'Matriks Ternormalisasi');

            const wsmData = calculationDetails.details.map((d) => {
                const entry = { 'Supplier': d.nama_supplier };
                d.criterion_breakdown.forEach((cb) => {
                    const crit = activeCriteria.find((c) => c.id === cb.criteria_id);
                    entry[crit?.nama_kriteria ?? cb.criteria_id] = cb.wsm_component.toFixed(4);
                });
                entry['Total Q (WSM)'] = d.wsm.toFixed(4);
                return entry;
            });
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(wsmData), 'WSM');

            const wpmData = calculationDetails.details.map((d) => {
                const entry = { 'Supplier': d.nama_supplier };
                d.criterion_breakdown.forEach((cb) => {
                    const crit = activeCriteria.find((c) => c.id === cb.criteria_id);
                    entry[crit?.nama_kriteria ?? cb.criteria_id] = cb.wpm_component !== null ? cb.wpm_component.toFixed(4) : '0.0000';
                });
                entry['Total P (WPM)'] = d.wpm.toFixed(4);
                return entry;
            });
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(wpmData), 'WPM');

            const waspasData = [...calculationDetails.details]
                .sort((a, b) => b.qi - a.qi)
                .map((d, i) => ({
                    'Ranking': i + 1,
                    'Supplier': d.nama_supplier,
                    'Q (WSM)': d.wsm.toFixed(4),
                    'P (WPM)': d.wpm.toFixed(4),
                    [`Qi (λ=${calculationDetails.lambda})`]: d.qi.toFixed(4),
                }));
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(waspasData), 'Skor WASPAS');
        }

        XLSX.writeFile(workbook, `Rekomendasi_${productName.replace(/\s+/g, '_')}.xlsx`);
    };

    const exportToPdf = () => {
        window.print();
    };

    const hasResults = selectedProduct && rankings.length > 0;

    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; inset: 0; padding: 24px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <AuthenticatedLayout
                header={
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="page-header">Rekomendasi Order</h2>
                        {hasResults && (
                            <div className="no-print flex flex-wrap gap-2">
                                <button
                                    onClick={exportToExcel}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                                >
                                    📊 Export Excel
                                </button>
                                <button
                                    onClick={exportToPdf}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
                                >
                                    📄 Export PDF
                                </button>
                            </div>
                        )}
                    </div>
                }
            >
                <Head title="Rekomendasi Order" />

                <div id="print-area" className="space-y-6">
                    <div className="no-print">
                        <ProductSelector
                            products={products}
                            productId={productId}
                            setProductId={setProductId}
                            loading={loading}
                            onSearch={handleSearch}
                        />
                    </div>

                    <ActiveCriteriaList criteria={criteria} />

                    {error && (
                        <div className="rounded-md bg-amber-50 p-4">
                            <p className="text-sm font-medium text-amber-800">⚠ {error}</p>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="rounded-md bg-green-50 p-4">
                            <p className="text-sm font-medium text-green-800">{flash.success}</p>
                        </div>
                    )}

                    {hasResults && (
                        <>
                            <RankingTable
                                rankings={rankings}
                                selectedProductId={selectedProductId}
                                selectedProduct={selectedProduct}
                            />

                            {isSuperAdmin && calculationDetails && (
                                <CalculationDetails
                                    calculationDetails={calculationDetails}
                                    activeCriteria={activeCriteria}
                                    supplierMap={supplierMap}
                                />
                            )}
                        </>
                    )}

                    {selectedProduct && rankings.length === 0 && !error && (
                        <div className="card">
                            <div className="p-6 text-center">
                                <p className="text-sm text-navy-500">Tidak ada data ranking untuk produk ini.</p>
                            </div>
                        </div>
                    )}
                </div>
            </AuthenticatedLayout>
        </>
    );
}
