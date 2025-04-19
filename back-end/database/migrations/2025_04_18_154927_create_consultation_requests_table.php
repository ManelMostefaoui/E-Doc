<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('consultation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients'); // Relie la table consultation_requests à la table des utilisateurs (patients)
            $table->text('message'); // Le message de demande de consultation
            $table->enum('status', ['pending', 'scheduled', 'confirmed', 'cancelled', 'modified'])->default('pending'); // Statut de la demande, par défaut "pending"
            $table->dateTime('appointment_date')->nullable(); // Date et heure du rendez-vous (null initialement)
            $table->timestamps(); // Colonnes created_at et updated_at
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_requests');
    }
};
