<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patient_vitals', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'Age']);
        });
    }

    public function down(): void
    {
        Schema::table('patient_vitals', function (Blueprint $table) {
            $table->string('full_name');
            $table->unsignedInteger('Age');
        });
    }
};
