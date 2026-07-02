<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('criteria', function (Blueprint $table) {
            $table->integer('urutan_prioritas')->nullable()->after('bobot_swara');
            $table->decimal('nilai_sj', 10, 4)->nullable()->after('bobot_swara');
        });
    }

    public function down(): void
    {
        Schema::table('criteria', function (Blueprint $table) {
            $table->dropColumn(['urutan_prioritas', 'nilai_sj']);
        });
    }
};
