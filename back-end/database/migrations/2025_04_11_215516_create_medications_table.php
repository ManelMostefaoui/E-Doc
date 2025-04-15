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
        Schema::create('medications', function (Blueprint $table) {
            $table->id(); // Clé primaire
            $table->string('name'); // Nom du médicament
            $table->string('category'); // Catégorie du médicament
            $table->string('dosage'); // Dosage du médicament
            $table->timestamps(); // Date de création et mise à jour
        });
    }

    public function down()
    {
        Schema::dropIfExists('medications');
    }

};
