import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import LaporanFilterForm from './components/LaporanFilterForm';
import LaporanSummaryCards from './components/LaporanSummaryCards';
import PoMasukTable from './components/PoMasukTable';
import PenjualanTable from './components/PenjualanTable';

export default function Index({ dari, sampai, poMasuk, penjualan, summary }) {
    const [formDari, setFormDari]     = useState(dari);
    const [formSampai, setFormSampai] = useState(sampai);
    const [tab, setTab] = useState('po');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('laporan.index'), { dari: formDari, sampai: formSampai }, { preserveState: true });
    };

    const exportToExcel = () => {
        let data = [];
        let fileName = '';

        if (tab === 'po') {
            fileName = `Laporan_PO_${formDari}_sd_${formSampai}.xlsx`;
            data = poMasuk.map(po => ({
                'Nomor PO': po.nomor_po,
                'Supplier': po.supplier,
                'Tanggal Terima': po.tanggal,
                'Jumlah Jenis Item': po.items_count,
                'Total Qty (pcs)': po.total_item_qty,
                'Nilai Transaksi (Rp)': Math.round(po.total_harga || 0)
            }));
        } else if (tab === 'sales') {
            fileName = `Laporan_Penjualan_${formDari}_sd_${formSampai}.xlsx`;
            data = penjualan.map(j => ({
                'Nomor Nota': j.nomor_nota,
                'Customer': j.customer,
                'Tanggal': j.tanggal,
                'Pembayaran': j.pembayaran ? j.pembayaran.toUpperCase() : '-',
                'Jumlah Jenis Item': j.items_count,
                'Total Qty (pcs)': j.total_item_qty,
                'Nilai Transaksi (Rp)': Math.round(j.total_harga || 0)
            }));
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Laporan");
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="page-header">Laporan Terintegrasi</h2>
                    <p className="text-sm text-navy-500">Stok Masuk (PO) ↔ Stok Keluar (Penjualan)</p>
                </div>
            }
        >
            <Head title="Laporan" />
            <div className="space-y-6">
                <LaporanFilterForm
                    dari={dari}
                    sampai={sampai}
                    formDari={formDari}
                    setFormDari={setFormDari}
                    formSampai={formSampai}
                    setFormSampai={setFormSampai}
                    onFilter={handleFilter}
                    onExport={exportToExcel}
                    tab={tab}
                />

                <LaporanSummaryCards summary={summary} />

                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'po', label: `🛒 PO Masuk (${poMasuk.length})` },
                        { key: 'sales', label: `💰 Penjualan (${penjualan.length})` },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                                tab === t.key ? 'bg-primary-600 text-white' : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'po' && <PoMasukTable poMasuk={poMasuk} summary={summary} />}
                {tab === 'sales' && <PenjualanTable penjualan={penjualan} summary={summary} />}
            </div>
        </AuthenticatedLayout>
    );
}
