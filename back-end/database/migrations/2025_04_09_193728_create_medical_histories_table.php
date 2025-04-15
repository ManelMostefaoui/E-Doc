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
        Schema::create('medical_histories', function (Blueprint $table) {
            // Clé primaire et relation avec patient
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');

            // Colonnes supplémentaires
            $table->enum('condition', ['congenital', 'general_disease', 'surgery', 'allergy'])->nullable();
            $table->date('date_appeared')->nullable();
            $table->enum('severity', ['mild', 'moderate', 'severe'])->nullable();
            $table->text('implication')->nullable();
            $table->text('treatment')->nullable();

            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_histories');
    }
};
