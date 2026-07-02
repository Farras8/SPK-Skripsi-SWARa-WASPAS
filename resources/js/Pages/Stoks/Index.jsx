import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import CreateStokForm from './components/CreateStokForm';
import EditStokForm from './components/EditStokForm';

const STATUS_STYLES = {
    safe: { class: 'bg-green-100 text-green-800', label: '🟢 Aman' },
    warning: { class: 'bg-yellow-100 text-yellow-800', label: '🟡 Segera Habis' },
    expired: { class: 'bg-red-100 text-red-800', label: '🔴 Kadaluarsa' },
};

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Math.round(n || 0));

export default function Index({ stoks, tab, stats, products }) {
    const { flash } = usePage().props;
    const [showCreate, setShowCreate] = useState(false);
    const [editingStok, setEditingStok] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStoks = stoks.filter((s) =>
        s.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.keterangan && s.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const groupedStoks = {};
    filteredStoks.forEach(s => {
        if (!groupedStoks[s.nama_barang]) groupedStoks[s.nama_barang] = { total_jumlah: 0, items: [] };
        groupedStoks[s.nama_barang].total_jumlah += s.jumlah;
        groupedStoks[s.nama_barang].items.push(s);
    });

    const toggleGroup = (namaBarang) => {
        setExpandedGroups(prev => ({ ...prev, [namaBarang]: !prev[namaBarang] }));
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const exportToExcel = () => {
        const data = [];
        let counter = 1;

        Object.entries(groupedStoks).forEach(([namaBarang, group]) => {
            group.items.forEach((s, index) => {
                data.push({
                    'No': counter++,
                    'Nama Barang': namaBarang,
                    'Batch': `Batch ${index + 1}`,
                    'Jumlah (pcs)': s.jumlah,
                    'Harga Beli (Rp)': Math.round(s.harga_beli || 0),
                    'Harga Jual (Rp)': Math.round(s.harga_jual || 0),
                    'Margin (Rp)': Math.round(s.margin_rp || 0),
                    'Margin (%)': s.margin_persen || 0,
                    'Tanggal Masuk': new Date(s.tanggal_masuk).toLocaleDateString('id-ID'),
                    'Tanggal Kadaluarsa': new Date(s.tanggal_kadaluarsa).toLocaleDateString('id-ID'),
                    'Sisa Hari': s.sisa_hari < 0 ? `Lewat ${Math.abs(s.sisa_hari)} hari` : `${s.sisa_hari} hari`,
                    'Status': s.status_kadaluarsa === 'expired' ? 'Kadaluarsa' : s.status_kadaluarsa === 'warning' ? 'Hampir Kadaluarsa' : 'Aman',
                    'Keterangan': s.keterangan || '-'
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Stok");
        XLSX.writeFile(workbook, "Laporan_Stok_Barang.xlsx");
    };

    return (
        <>
            <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="page-header">
                        Manajemen Stok
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToExcel}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                        >
                            📊 Export Excel
                        </button>
                        <PrimaryButton onClick={() => setShowCreate(true)}>
                            + Tambah Stok
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Stok Barang" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}
                
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{flash.error}</p>
                    </div>
                )}

                <Modal show={showCreate} onClose={() => setShowCreate(false)} maxWidth="md">
                    <CreateStokForm onClose={() => setShowCreate(false)} products={products} stoks={stoks} />
                </Modal>
                
                <Modal show={editingStok !== null} onClose={() => setEditingStok(null)} maxWidth="md">
                    {editingStok && (
                        <EditStokForm stok={editingStok} onCancel={() => setEditingStok(null)} />
                    )}
                </Modal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white border-l-4 border-navy-600 p-4 shadow-md">
                        <p className="text-sm text-navy-600">Total Item</p>
                        <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 border-l-4 border-orange-500 p-4 shadow-md">
                        <p className="text-sm text-orange-700">Stok Menipis (&lt;10)</p>
                        <p className="text-2xl font-bold text-orange-800">{stats.stok_menipis}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-500 p-4 shadow-md">
                        <p className="text-sm text-yellow-700">Hampir Kadaluarsa</p>
                        <p className="text-2xl font-bold text-yellow-800">{stats.hampir_kadaluarsa}</p>
                        <p className="text-xs text-yellow-600">dalam 30 hari</p>
                    </div>
                    <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
                        <p className="text-sm text-red-700">Sudah Kadaluarsa</p>
                        <p className="text-2xl font-bold text-red-800">{stats.sudah_kadaluarsa}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {['semua', 'fifo', 'warning', 'expired'].map((t) => (
                            <Link
                                key={t}
                                href={route('stoks.index', t === 'semua' ? {} : { tab: t })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${tab === t
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                                    }`}
                            >
                                {t === 'semua' ? 'Semua' : t === 'fifo' ? '📦 FIFO' : t === 'warning' ? '🟡 Hampir Expired' : '🔴 Expired'}
                            </Link>
                        ))}
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-full border border-navy-300 pl-9 pr-4 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
                            placeholder="Cari nama barang..."
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Barang</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Harga Beli</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Harga Jual</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Margin</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Tgl Masuk</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Tgl Kadaluarsa</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Sisa Hari</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {Object.entries(groupedStoks).map(([namaBarang, group]) => {
                                        const isExpanded = expandedGroups[namaBarang];
                                        const { total_jumlah, items } = group;
                                        const sampleRow = items[0];
                                        
                                        return (
                                            <React.Fragment key={namaBarang}>
                                                <tr className={`${total_jumlah < 10 && total_jumlah > 0 ? 'bg-orange-50' : 'hover:bg-navy-50'}`}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-navy-900 border-l-4 border-primary-500">
                                                        {namaBarang}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold">
                                                        <span className={total_jumlah < 10 && total_jumlah > 0 ? 'text-orange-600' : total_jumlah === 0 ? 'text-red-600' : 'text-navy-900'}>
                                                            {total_jumlah}
                                                            {total_jumlah < 10 && total_jumlah > 0 && <span className="ml-1 text-xs">⚠️</span>}
                                                            {total_jumlah === 0 && <span className="ml-1 text-xs">🚫</span>}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                                        {sampleRow.harga_beli ? fmt(sampleRow.harga_beli) : <span className="text-gray-400 text-xs italic">—</span>}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                                                        {fmt(sampleRow.harga_jual)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                        {sampleRow.harga_beli ? (
                                                            <span className={`font-semibold ${sampleRow.margin_rp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {sampleRow.margin_rp >= 0 ? '+' : ''}{fmt(sampleRow.margin_rp)}
                                                                <span className="ml-1 text-xs font-normal">
                                                                    ({sampleRow.margin_persen >= 0 ? '+' : ''}{sampleRow.margin_persen}%)
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">—</span>
                                                        )}
                                                    </td>
                                                    <td colSpan={3} className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500 italic">
                                                        Ada {items.length} batch masuk (tanggal beda-beda)
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500"></td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        <button 
                                                            onClick={() => toggleGroup(namaBarang)} 
                                                            className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-800 hover:bg-navy-200 transition"
                                                        >
                                                            {isExpanded ? 'Sembunyikan Kadaluarsa ▲' : 'Lihat Kadaluarsa ▼'}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {isExpanded && items.map((s, index) => (
                                                    <tr key={s.id} className={s.status_kadaluarsa === 'expired' ? 'bg-red-50' : s.status_kadaluarsa === 'warning' ? 'bg-yellow-50' : 'bg-gray-50'}>
                                                        <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500 pl-10">
                                                            ↳ Batch {index + 1}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-xs font-medium text-gray-700">
                                                            {s.jumlah} pcs
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-700">
                                                            {s.harga_beli ? fmt(s.harga_beli) : <span className="text-gray-400 italic">—</span>}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-700 font-medium">
                                                            {fmt(s.harga_jual)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                            {s.harga_beli ? (
                                                                <span className={`font-semibold ${s.margin_rp >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {s.margin_rp >= 0 ? '+' : ''}{fmt(s.margin_rp)}
                                                                    <span className="ml-1 text-xs font-normal">({s.margin_persen}%)</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs italic">—</span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-600">
                                                            {new Date(s.tanggal_masuk).toLocaleDateString('id-ID')}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-navy-600 font-semibold">
                                                            {new Date(s.tanggal_kadaluarsa).toLocaleDateString('id-ID')}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-semibold">
                                                            {s.sisa_hari < 0 ? (
                                                                <span className="text-red-600">Lewat {Math.abs(s.sisa_hari)} hari</span>
                                                            ) : (
                                                                <span className={s.sisa_hari <= 30 ? 'text-yellow-600' : 'text-green-600'}>
                                                                    {s.sisa_hari} hari
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${STATUS_STYLES[s.status_kadaluarsa].class}`}>
                                                                {STATUS_STYLES[s.status_kadaluarsa].label}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => setEditingStok(s)} className="text-primary-600 hover:text-primary-800 text-xs">Edit</button>
                                                                <DangerButton onClick={() => handleDelete(s.id)} className="px-2 py-1 text-[10px]">Hapus</DangerButton>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                    
                                    {stoks.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-8 text-center text-sm text-navy-400">
                                                Tidak ada data stok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                {tab === 'fifo' && stoks.length > 0 && (
                    <div className="rounded-md bg-primary-50 border-l-4 border-primary-600 p-4">
                        <p className="text-sm text-primary-800">
                            📦 <strong>FIFO (First In First Out):</strong> Barang diurutkan berdasarkan tanggal kadaluarsa terdekat — jual/keluarkan dari atas terlebih dahulu.
                        </p>
                    </div>
                )}
            </div>

        </AuthenticatedLayout>

        <ConfirmDialog
            show={confirmDelete !== null}
            title="Hapus Stok"
            message="Apakah Anda yakin ingin menghapus batch stok ini? Data stok yang dihapus tidak dapat dikembalikan."
            confirmLabel="Ya, Hapus"
            variant="danger"
            onConfirm={() => { router.delete(route('stoks.destroy', confirmDelete), { preserveScroll: true }); setConfirmDelete(null); }}
            onCancel={() => setConfirmDelete(null)}
        />
        </>
    );
}
