<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteria_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('criteria_id')->constrained('criteria')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->decimal('nilai', 15, 4);
            $table->timestamps();

            $table->unique(['criteria_id', 'supplier_id', 'product_id'], 'criteria_supplier_product_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria_values');
    }
};
