<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'supplier_id',
        'product_id',
        'nomor_po',
        'tanggal_po',
        'tanggal_terima',
        'status',
        'total_harga',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_po' => 'date',
        'tanggal_terima' => 'date',
        'total_harga' => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeDiterima($query)
    {
        return $query->where('status', 'diterima');
    }

    public static function generateNomorPo(): string
    {
        $prefix = 'PO-' . now()->format('Ymd') . '-';
        $last = static::where('nomor_po', 'like', $prefix . '%')
            ->orderByDesc('nomor_po')
            ->value('nomor_po');

        $seq = $last ? (int) substr($last, -3) + 1 : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }
}
