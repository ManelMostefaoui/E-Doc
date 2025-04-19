<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\LaravelIgnition\Http\Requests\UpdateConfigRequest;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_vitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->date('vital_date')->nullable();
            $table->string('full_name');
            $table->unsignedInteger('Age');
            $table->unsignedInteger('height');
            $table->unsignedInteger('weight');
            $table->unsignedInteger('blood_pressure')->nullable();
            $table->unsignedInteger('temperature')->nullable();
            $table->unsignedInteger('heart_rate')->nullable();
            $table->unsignedInteger('blood_sugar')->nullable();
            $table->text('other_observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_vitals');
    }
};
