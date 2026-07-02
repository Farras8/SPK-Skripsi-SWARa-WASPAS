import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const fmt = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function Show({ sale }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('sales.index')} className="text-sm text-primary-600 hover:text-primary-800">
                        ← Kembali ke Penjualan
                    </Link>
                    <h2 className="page-header">Detail Penjualan: {sale.nomor_nota}</h2>
                </div>
            }
        >
            <Head title={`Penjualan ${sale.nomor_nota}`} />
            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                {/* Info */}
                <div className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">Nomor Nota:</span>{' '}
                                <span className="font-mono font-semibold text-navy-900">{sale.nomor_nota}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tanggal:</span>{' '}
                                <span className="font-medium text-navy-800">
                                    {new Date(sale.tanggal_jual).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Customer:</span>{' '}
                                <span className="font-semibold text-navy-900">
                                    {sale.customer?.nama_customer ?? <span className="italic text-gray-400">Walk-in</span>}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Jenis Pembayaran:</span>{' '}
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    sale.jenis_pembayaran === 'tunai'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-orange-100 text-orange-800'
                                }`}>
                                    {sale.jenis_pembayaran === 'tunai' ? '💵 Tunai' : '📒 Kredit'}
                                </span>
                            </div>
                            {sale.keterangan && (
                                <div className="col-span-2">
                                    <span className="text-gray-500">Keterangan:</span>{' '}
                                    <span className="text-navy-700">{sale.keterangan}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xl font-bold text-primary-700">{fmt(sale.total_harga)}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="card overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-navy-800">
                            📦 Daftar Item
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Barang</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Jumlah</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Harga Satuan</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {sale.items?.map((item) => (
                                    <tr key={item.id} className="hover:bg-navy-50">
                                        <td className="px-4 py-3 text-sm font-medium text-navy-900">
                                            <div>{item.nama_barang}</div>
                                            {item.stok && (
                                                <div className="text-xs font-normal text-gray-500">
                                                    Exp: {new Date(item.stok.tanggal_kadaluarsa).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                    {item.stok.keterangan ? ` (${item.stok.keterangan})` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-navy-700">{item.jumlah}</td>
                                        <td className="px-4 py-3 text-right text-sm text-navy-700">{fmt(item.harga_satuan)}</td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-navy-900">
                                            {fmt(item.total_harga)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-navy-50">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-navy-800">Total:</td>
                                    <td className="px-4 py-3 text-right text-base font-bold text-primary-700">
                                        {fmt(sale.total_harga)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Hutang notice */}
                {sale.jenis_pembayaran === 'kredit' && (
                    <div className="card p-4 sm:p-6 bg-orange-50 border border-orange-200">
                        <p className="text-sm font-semibold text-orange-800">
                            📒 Transaksi kredit: hutang kasbon sebesar {fmt(sale.total_harga)} sudah dicatat otomatis.
                        </p>
                        {sale.customer && (
                            <p className="text-xs text-orange-700 mt-1">
                                Customer: {sale.customer.nama_customer}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
