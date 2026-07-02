<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('criteria_values');

        Schema::dropIfExists('criteria');
        Schema::create('criteria', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kriteria');
            $table->string('tipe');
            $table->decimal('bobot_swara', 10, 6)->nullable();
            $table->timestamps();
        });

        Schema::create('product_supplier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->decimal('harga_satuan', 15, 2)->nullable();
            $table->tinyInteger('skor_kualitas')->nullable();
            $table->tinyInteger('skor_potongan')->nullable();
            $table->tinyInteger('skor_min_order')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'supplier_id']);
        });

        Schema::create('supplier_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->decimal('jam_kirim', 8, 2)->nullable();
            $table->tinyInteger('skor_retur')->nullable();
            $table->timestamps();

            $table->unique(['supplier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_services');
        Schema::dropIfExists('product_supplier');

        Schema::dropIfExists('criteria');
        Schema::create('criteria', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kriteria');
            $table->string('kategori_kriteria');
            $table->string('tipe');
            $table->decimal('bobot_swara', 10, 6)->nullable();
            $table->integer('urutan_prioritas')->nullable();
            $table->json('sub_criteria')->nullable();
            $table->timestamps();
        });

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
};
