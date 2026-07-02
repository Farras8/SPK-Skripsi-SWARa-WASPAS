<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesTransaction extends Model
{
    protected $fillable = [
        'customer_id',
        'nomor_nota',
        'tanggal_jual',
        'jenis_pembayaran',
        'total_harga',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_jual' => 'date',
        'total_harga' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesItem::class);
    }

    public function hutang(): BelongsTo
    {
        return $this->belongsTo(Hutang::class);
    }

    public function scopeTunai($query)
    {
        return $query->where('jenis_pembayaran', 'tunai');
    }

    public function scopeKredit($query)
    {
        return $query->where('jenis_pembayaran', 'kredit');
    }

    public static function generateNomorNota(): string
    {
        $prefix = 'NOTA-' . now()->format('Ymd') . '-';
        $last = static::where('nomor_nota', 'like', $prefix . '%')
            ->orderByDesc('nomor_nota')
            ->value('nomor_nota');

        $seq = $last ? (int) substr($last, -3) + 1 : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }
}
