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

        Schema::create('personal_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->boolean('smoker')->nullable();
            $table->integer('cigarette_count')->nullable();
            $table->boolean('chewing_tobacco')->nullable();
            $table->integer('chewing_tobacco_count')->nullable();
            $table->integer('first_use_age')->nullable();
            $table->boolean('former_smoker')->nullable();
            $table->string('exposure_period')->nullable();
            $table->string('alcohol')->nullable();
            $table->string('medications')->nullable();
            $table->text('other')->nullable(); // Changed to text for larger content
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_history');
    }
};
