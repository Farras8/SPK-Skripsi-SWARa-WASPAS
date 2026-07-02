<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_services', function (Blueprint $table) {
            $table->renameColumn('skor_retur', 'pelayanan');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_services', function (Blueprint $table) {
            $table->renameColumn('pelayanan', 'skor_retur');
        });
    }
};
