<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('criteria');
    }
};
