<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $criteria = DB::table('criteria')->where('nama_kriteria', 'Potongan Tunai')->first();
        if ($criteria) {
            DB::table('criteria_values')->where('criteria_id', $criteria->id)->delete();
            DB::table('criteria')->where('id', $criteria->id)->delete();
        }
    }

    public function down(): void
    {
    }
};
