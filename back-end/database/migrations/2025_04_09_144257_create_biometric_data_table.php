<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('biometric_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->float('height')->nullable(); // Taille en cm
            $table->float('weight')->nullable(); // Poids en kg
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('biometric_data');
    }
};
