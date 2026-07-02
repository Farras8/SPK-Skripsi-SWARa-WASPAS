<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_supplier',
        'potongan_tunai',
    ];

    public function productSuppliers(): HasMany
    {
        return $this->hasMany(ProductSupplier::class);
    }

    public function criteriaValues(): HasMany
    {
        return $this->hasMany(CriteriaValue::class);
    }

    public function supplierCriteriaValues(): HasMany
    {
        return $this->hasMany(CriteriaValue::class)->whereNull('product_id');
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
