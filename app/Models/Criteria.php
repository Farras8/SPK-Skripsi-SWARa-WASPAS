<?php

namespace App\Models;

use App\Enums\CriteriaType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Criteria extends Model
{
    use HasFactory;

    protected $table = 'criteria';

    protected $fillable = [
        'nama_kriteria',
        'tipe',
        'kategori',
        'options',
        'satuan',
        'bobot_swara',
        'nilai_sj',
        'urutan_prioritas',
    ];

    protected function casts(): array
    {
        return [
            'tipe' => CriteriaType::class,
            'options' => 'array',
            'bobot_swara' => 'decimal:6',
            'nilai_sj' => 'decimal:4',
        ];
    }

    /**
     * Get all criteria values for this criteria
     */
    public function values(): HasMany
    {
        return $this->hasMany(CriteriaValue::class);
    }

    /**
     * Scope untuk filter kriteria per product (kategori = 'product')
     */
    public function scopeForProduct($query)
    {
        return $query->where('kategori', 'product');
    }

    /**
     * Scope untuk filter kriteria per supplier (kategori = 'supplier')
     */
    public function scopeForSupplier($query)
    {
        return $query->where('kategori', 'supplier');
    }
}
