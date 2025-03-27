<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('medical_histories', function (Blueprint $table) {
            // Ajouter des colonnes séparées pour chaque type d'antécédents médicaux
            $table->text('congenital_disease')->nullable()->after('patient_id');
            $table->text('general_disease')->nullable()->after('congenital_disease');
            $table->text('surgery')->nullable()->after('general_disease');
            $table->text('allergy')->nullable()->after('surgery');

            // Supprimer l'ancienne colonne "type" si elle existe
            $table->dropColumn('type');
        });
    }

    public function down()
    {
        Schema::table('medical_histories', function (Blueprint $table) {
            // Supprimer les nouvelles colonnes en cas de rollback
            $table->dropColumn(['congenital_disease', 'general_disease', 'surgery', 'allergy']);

            // Remettre l'ancienne colonne "type"
            $table->enum('type', ['congenital', 'general_disease', 'surgery', 'allergy'])->after('patient_id');
        });
    }
};
