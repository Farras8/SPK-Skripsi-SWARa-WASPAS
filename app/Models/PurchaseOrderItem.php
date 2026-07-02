<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'nama_barang',
        'jumlah',
        'harga_satuan',
        'diskon_satuan',
        'total_harga',
        'tanggal_kadaluarsa',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'diskon_satuan' => 'decimal:2',
        'total_harga' => 'decimal:2',
        'tanggal_kadaluarsa' => 'date',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
