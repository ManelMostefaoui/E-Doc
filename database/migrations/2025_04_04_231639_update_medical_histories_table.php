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
        Schema::table('medical_histories', function (Blueprint $table) {
            // Ajoute les nouvelles colonnes
            $table->enum('condition', ['congenital', 'general_disease', 'surgery', 'allergy'])->nullable()->after('patient_id');
            $table->date('date_appeared')->nullable()->after('condition');
            $table->enum('severity', ['mild', 'moderate', 'severe'])->nullable()->after('date_appeared');
            $table->text('implication')->nullable()->after('severity');
            $table->text('treatment')->nullable()->after('implication');

            // Supprimer les anciennes colonnes SI nécessaires (optionnel)
            // $table->dropColumn([...]);
        });
    }

    public function down(): void
    {
        Schema::table('medical_histories', function (Blueprint $table) {
            $table->dropColumn(['condition', 'date_appeared', 'severity', 'implication', 'treatment']);
        });
    }

};
