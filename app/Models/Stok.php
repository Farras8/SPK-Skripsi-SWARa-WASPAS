<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Stok extends Model
{
    protected $fillable = [
        'product_id',
        'nama_barang',
        'jumlah',
        'harga_jual',
        'harga_beli',
        'tanggal_masuk',
        'tanggal_kadaluarsa',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_kadaluarsa' => 'date',
    ];

    protected $appends = ['status_kadaluarsa', 'sisa_hari', 'margin_rp', 'margin_persen'];


    public function getSisaHariAttribute(): int
    {
        return Carbon::now()->startOfDay()->diffInDays(Carbon::parse($this->tanggal_kadaluarsa), false);
    }

    public function getStatusKadaluarsaAttribute(): string
    {
        $sisa = $this->sisa_hari;

        if ($sisa < 0) return 'expired';
        if ($sisa <= 30) return 'warning';
        return 'safe';
    }

    public function getMarginRpAttribute(): float
    {
        if ($this->harga_beli === null) {
            return 0;
        }

        return (float) $this->harga_jual - (float) $this->harga_beli;
    }

    public function getMarginPersenAttribute(): float
    {
        if (!$this->harga_beli || (float) $this->harga_beli === 0.0) {
            return 0;
        }

        return round((((float) $this->harga_jual - (float) $this->harga_beli) / (float) $this->harga_beli) * 100, 2);
    }

    public function scopeHampirKadaluarsa($query, int $days = 30)
    {
        return $query->whereBetween('tanggal_kadaluarsa', [
            Carbon::now()->startOfDay(),
            Carbon::now()->addDays($days)->endOfDay(),
        ]);
    }

    public function scopeSudahKadaluarsa($query)
    {
        return $query->where('tanggal_kadaluarsa', '<', Carbon::now()->startOfDay());
    }

    public function scopeFifoOrder($query)
    {
        return $query->orderBy('tanggal_kadaluarsa', 'asc');
    }

    public function salesItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SalesItem::class);
    }

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
