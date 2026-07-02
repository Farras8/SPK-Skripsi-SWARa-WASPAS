<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Tambah kolom kategori ke tabel criteria
        Schema::table('criteria', function (Blueprint $table) {
            $table->string('kategori')->default('product')->after('tipe');
        });

        // Step 2: Buat tabel criteria_values
        Schema::create('criteria_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('criteria_id')->constrained('criteria')->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->cascadeOnDelete();
            $table->decimal('nilai', 15, 4);
            $table->timestamps();
            
            $table->index(['criteria_id', 'supplier_id', 'product_id'], 'idx_criteria_supplier_product');
        });

        // Step 3: Update kategori untuk kriteria yang sudah ada
        DB::table('criteria')->where('nama_kriteria', 'Kecepatan Pengiriman')->update(['kategori' => 'supplier']);
        DB::table('criteria')->where('nama_kriteria', 'Layanan Retur')->update(['kategori' => 'supplier']);
        DB::table('criteria')->where('nama_kriteria', 'Pelayanan')->update(['kategori' => 'supplier']);

        // Step 4: Migrate data dari product_supplier ke criteria_values
        $this->migrateProductSupplierData();

        // Step 5: Migrate data dari supplier_services ke criteria_values
        $this->migrateSupplierServicesData();

        Schema::table('product_supplier', function (Blueprint $table) {
            $table->dropColumn(['harga_satuan', 'skor_kualitas', 'skor_potongan', 'skor_min_order']);
        });

        // Step 7: Drop tabel supplier_services
        Schema::dropIfExists('supplier_services');
    }

    public function down(): void
    {
        // Recreate supplier_services
        Schema::create('supplier_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnDelete();
            $table->decimal('jam_kirim', 8, 2)->nullable();
            $table->tinyInteger('pelayanan')->nullable();
            $table->timestamps();
            $table->unique(['supplier_id']);
        });

        // Recreate columns in product_supplier
        Schema::table('product_supplier', function (Blueprint $table) {
            $table->decimal('harga_satuan', 15, 2)->nullable()->after('supplier_id');
            $table->tinyInteger('skor_kualitas')->nullable()->after('harga_satuan');
            $table->tinyInteger('skor_potongan')->nullable()->after('skor_kualitas');
            $table->tinyInteger('skor_min_order')->nullable()->after('skor_potongan');
        });

        // Migrate data back from criteria_values to product_supplier
        $this->restoreProductSupplierData();

        // Migrate data back from criteria_values to supplier_services
        $this->restoreSupplierServicesData();

        // Drop criteria_values table
        Schema::dropIfExists('criteria_values');

        // Remove kategori column from criteria
        Schema::table('criteria', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }

    private function migrateProductSupplierData(): void
    {
        $criteriaMap = [
            'Harga Satuan' => 'harga_satuan',
            'Kualitas Barang' => 'skor_kualitas',
            'Potongan Tunai' => 'skor_potongan',
            'Minimal Order' => 'skor_min_order',
        ];

        foreach ($criteriaMap as $criteriaName => $columnName) {
            $criteria = DB::table('criteria')->where('nama_kriteria', $criteriaName)->first();
            
            if ($criteria) {
                $productSuppliers = DB::table('product_supplier')
                    ->whereNotNull($columnName)
                    ->get();

                foreach ($productSuppliers as $ps) {
                    DB::table('criteria_values')->insert([
                        'criteria_id' => $criteria->id,
                        'supplier_id' => $ps->supplier_id,
                        'product_id' => $ps->product_id,
                        'nilai' => $ps->$columnName,
                        'created_at' => $ps->created_at ?? now(),
                        'updated_at' => $ps->updated_at ?? now(),
                    ]);
                }
            }
        }
    }

    private function migrateSupplierServicesData(): void
    {
        if (!Schema::hasTable('supplier_services')) {
            return;
        }

        $criteriaMap = [
            'Kecepatan Pengiriman' => 'jam_kirim',
            'Pelayanan' => 'pelayanan',
            'Layanan Retur' => 'pelayanan', // fallback jika masih pakai nama lama
        ];

        foreach ($criteriaMap as $criteriaName => $columnName) {
            $criteria = DB::table('criteria')->where('nama_kriteria', $criteriaName)->first();
            
            if ($criteria) {
                $supplierServices = DB::table('supplier_services')
                    ->whereNotNull($columnName)
                    ->get();

                foreach ($supplierServices as $ss) {
                    // Check if already exists to avoid duplicates
                    $exists = DB::table('criteria_values')
                        ->where('criteria_id', $criteria->id)
                        ->where('supplier_id', $ss->supplier_id)
                        ->whereNull('product_id')
                        ->exists();

                    if (!$exists) {
                        DB::table('criteria_values')->insert([
                            'criteria_id' => $criteria->id,
                            'supplier_id' => $ss->supplier_id,
                            'product_id' => null,
                            'nilai' => $ss->$columnName,
                            'created_at' => $ss->created_at ?? now(),
                            'updated_at' => $ss->updated_at ?? now(),
                        ]);
                    }
                }
            }
        }
    }

    private function restoreProductSupplierData(): void
    {
        $criteriaMap = [
            'Harga Satuan' => 'harga_satuan',
            'Kualitas Barang' => 'skor_kualitas',
            'Potongan Tunai' => 'skor_potongan',
            'Minimal Order' => 'skor_min_order',
        ];

        foreach ($criteriaMap as $criteriaName => $columnName) {
            $criteria = DB::table('criteria')->where('nama_kriteria', $criteriaName)->first();
            
            if ($criteria) {
                $values = DB::table('criteria_values')
                    ->where('criteria_id', $criteria->id)
                    ->whereNotNull('product_id')
                    ->get();

                foreach ($values as $value) {
                    DB::table('product_supplier')
                        ->where('product_id', $value->product_id)
                        ->where('supplier_id', $value->supplier_id)
                        ->update([
                            $columnName => $value->nilai,
                        ]);
                }
            }
        }
    }

    private function restoreSupplierServicesData(): void
    {
        $criteriaMap = [
            'Kecepatan Pengiriman' => 'jam_kirim',
            'Pelayanan' => 'pelayanan',
            'Layanan Retur' => 'pelayanan',
        ];

        foreach ($criteriaMap as $criteriaName => $columnName) {
            $criteria = DB::table('criteria')->where('nama_kriteria', $criteriaName)->first();
            
            if ($criteria) {
                $values = DB::table('criteria_values')
                    ->where('criteria_id', $criteria->id)
                    ->whereNull('product_id')
                    ->get();

                foreach ($values as $value) {
                    DB::table('supplier_services')->updateOrInsert(
                        ['supplier_id' => $value->supplier_id],
                        [
                            $columnName => $value->nilai,
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        }
    }
};
