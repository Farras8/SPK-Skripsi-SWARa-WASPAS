<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_produk',
        'kategori',
    ];

    public function productSuppliers(): HasMany
    {
        return $this->hasMany(ProductSupplier::class);
    }

    public function criteriaValues(): HasMany
    {
        return $this->hasMany(CriteriaValue::class);
    }

    public function stoks(): HasMany
    {
        return $this->hasMany(Stok::class);
    }

    public function getTotalStokAttribute(): int
    {
        return $this->stoks()->sum('jumlah');
    }
}
