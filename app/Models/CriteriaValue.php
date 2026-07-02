<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CriteriaValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'criteria_id',
        'supplier_id',
        'product_id',
        'nilai',
    ];

    protected function casts(): array
    {
        return [
            'nilai' => 'decimal:4',
        ];
    }

    /**
     * Get the criteria that owns this value
     */
    public function criteria(): BelongsTo
    {
        return $this->belongsTo(Criteria::class);
    }

    /**
     * Get the supplier that owns this value
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get the product that owns this value (nullable for supplier-level criteria)
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope untuk filter nilai kriteria per product
     */
    public function scopeForProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope untuk filter nilai kriteria per supplier (tanpa product)
     */
    public function scopeForSupplierOnly($query)
    {
        return $query->whereNull('product_id');
    }

    /**
     * Scope untuk filter nilai kriteria per supplier dan product
     */
    public function scopeForSupplierAndProduct($query, $supplierId, $productId = null)
    {
        $query->where('supplier_id', $supplierId);
        
        if ($productId !== null) {
            $query->where('product_id', $productId);
        } else {
            $query->whereNull('product_id');
        }
        
        return $query;
    }
}
