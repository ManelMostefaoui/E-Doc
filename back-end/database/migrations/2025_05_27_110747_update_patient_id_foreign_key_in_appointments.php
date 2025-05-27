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
        Schema::table('appointments', function (Blueprint $table) {
            // Drop the existing FK constraint
            $table->dropForeign(['patient_id']);

            // Add it again with ON DELETE CASCADE
            $table->foreign('patient_id')
                  ->references('id')->on('patients')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);

            // Restore the foreign key without cascade (default Laravel behavior)
            $table->foreign('patient_id')
                  ->references('id')->on('patients');
        });
    }
};
