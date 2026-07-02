<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'nama_customer',
        'alamat',
        'no_hp',
        'plafon_kasbon',
        'is_blacklisted',
        'blacklisted_at',
        'alasan_blacklist',
    ];

    protected $casts = [
        'plafon_kasbon' => 'decimal:2',
        'is_blacklisted' => 'boolean',
        'blacklisted_at' => 'datetime',
    ];

    protected $appends = ['total_hutang_aktif', 'sisa_plafon', 'bisa_kasbon'];

    public function hutangs(): HasMany
    {
        return $this->hasMany(Hutang::class);
    }

    public function getTotalHutangAktifAttribute(): float
    {
        return (float) $this->hutangs()
            ->where('status', 'belum_lunas')
            ->sum('jumlah_hutang');
    }

    public function getSisaPlafonAttribute(): float
    {
        return (float) $this->plafon_kasbon - $this->total_hutang_aktif;
    }

    public function getBisaKasbonAttribute(): bool
    {
        return !$this->is_blacklisted && $this->sisa_plafon > 0;
    }
}
