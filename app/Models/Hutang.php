<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hutang extends Model
{
    protected $fillable = [
        'customer_id',
        'jumlah_hutang',
        'tanggal_hutang',
        'tanggal_lunas',
        'keterangan',
        'status',
    ];

    protected $casts = [
        'jumlah_hutang' => 'decimal:2',
        'tanggal_hutang' => 'date',
        'tanggal_lunas' => 'date',
    ];

    protected $appends = ['umur_hari', 'status_aging'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getUmurHariAttribute(): int
    {
        if ($this->status === 'lunas') {
            return 0;
        }

        return Carbon::parse($this->tanggal_hutang)->diffInDays(Carbon::now());
    }

    public function getStatusAgingAttribute(): string
    {
        if ($this->status === 'lunas') {
            return 'lunas';
        }

        $umur = $this->umur_hari;

        if ($umur <= 7) return 'hijau';
        if ($umur <= 30) return 'kuning';
        return 'merah';
    }

    public function scopeBelumLunas($query)
    {
        return $query->where('status', 'belum_lunas');
    }

    public function scopeLunas($query)
    {
        return $query->where('status', 'lunas');
    }
}
