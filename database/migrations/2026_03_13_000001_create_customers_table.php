<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('nama_customer');
            $table->string('alamat')->nullable();
            $table->string('no_hp')->nullable();
            $table->decimal('plafon_kasbon', 15, 2)->default(200000);
            $table->boolean('is_blacklisted')->default(false);
            $table->timestamp('blacklisted_at')->nullable();
            $table->text('alasan_blacklist')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
