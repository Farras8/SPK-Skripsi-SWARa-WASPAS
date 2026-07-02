import React from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ProductSelector({ products, productId, setProductId, loading, onSearch }) {
    const grouped = products.reduce((acc, p) => {
        const key = p.kategori || 'Lainnya';
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {});

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    Pilih Produk yang Ingin Dibeli
                </h3>
                <p className="mt-1 text-sm text-navy-600">
                    Sistem akan mencari supplier terbaik berdasarkan kriteria dan bobot yang sudah ditetapkan.
                </p>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1">
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="block w-full rounded-md border-navy-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="">— Pilih Produk —</option>
                            {Object.entries(grouped).map(([kategori, items]) => (
                                <optgroup key={kategori} label={kategori}>
                                    {items.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nama_produk}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <PrimaryButton
                        onClick={onSearch}
                        disabled={!productId || loading}
                        className="whitespace-nowrap"
                    >
                        {loading ? 'Mencari...' : '🔍 Cari Supplier Terbaik'}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
