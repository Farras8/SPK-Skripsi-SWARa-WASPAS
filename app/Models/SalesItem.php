<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesItem extends Model
{
    protected $fillable = [
        'sales_transaction_id',
        'stok_id',
        'nama_barang',
        'jumlah',
        'harga_satuan',
        'total_harga',
    ];

    protected $casts = [
        'harga_satuan' => 'decimal:2',
        'total_harga' => 'decimal:2',
    ];

    public function salesTransaction(): BelongsTo
    {
        return $this->belongsTo(SalesTransaction::class);
    }

    public function stok(): BelongsTo
    {
        return $this->belongsTo(Stok::class);
    }
}
