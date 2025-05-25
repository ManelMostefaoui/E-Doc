<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add the missing columns to the screenings table
        Schema::table('screenings', function (Blueprint $table) {
            // Add category column
            $table->enum('category', [
                'respiratory_diseases',
                'heart_and_vascular_diseases',
                'digestive_system_diseases',
                'endocrine_diseases',
                'reproductive_system_diseases',
                'blood_disorders',
                'urinary_tract_and_kidney_diseases',
                'skin_diseases',
                'ent_diseases',
                'eye_diseases',
                'neurological_and_mental_disorders',
                'rheumatic_diseases',
                'cancers'
            ])->default('respiratory_diseases');

            // Add type column (will replace test_type functionality)
            $table->string('type')->after('category');

            // Make result nullable if it's not already
            $table->text('result')->nullable()->change();
        });

        // Update existing records with new categories and types
        DB::table('screenings')->get()->each(function ($screening) {
            $newCategory = 'respiratory_diseases'; // default category
            $newType = 'Other'; // default type

            // Map existing test_type values to new categories and types
            $categoryMap = [
                'respiratory_diseases' => ['Asthma', 'Allergy', 'Tuberculosis', 'Pneumonia', 'Other'],
                'heart_and_vascular_diseases' => ['High blood pressure (Hypertension)', 'Acute rheumatic fever (ARF)', 'Arrhythmia (Heart rhythm disorder)'],
                'digestive_system_diseases' => ['Hepatitis', 'Crohn\'s disease', 'Celiac disease', 'Stomach ulcer (Gastric ulcer)', 'Other'],
                'endocrine_diseases' => ['Diabetes mellitus', 'Obesity', 'Diabetes insipidus', 'Hypothyroidism', 'Other'],
                'reproductive_system_diseases' => ['Ovarian cyst', 'Menstrual disorders', 'Other'],
                'blood_disorders' => ['Thalassemia', 'Sickle cell anemia (Sickle cell disease)', 'Anemia', 'Other'],
                'urinary_tract_and_kidney_diseases' => ['Urinary tract infection (UTI)', 'Kidney failure (Renal failure)', 'Other'],
                'skin_diseases' => ['Psoriasis', 'Skin rash', 'Other'],
                'ent_diseases' => ['Sinusitis', 'Tonsillitis', 'Other'],
                'eye_diseases' => ['Uveitis', 'Conjunctivitis', 'Other'],
                'neurological_and_mental_disorders' => ['Epilepsy', 'Brain tumors (Cavernoma)', 'Multiple sclerosis (MS)', 'Depression', 'Obsessive-compulsive disorder (OCD)', 'Bipolar disorder', 'Other'],
                'rheumatic_diseases' => ['Rheumatoid arthritis (RA)', 'Scoliosis', 'Systemic lupus erythematosus (Lupus)', 'Sciatica', 'Clubfoot (Talipes equinovarus)', 'Adult-onset Still\'s disease'],
                'cancers' => ['Cancer']
            ];

            // Try to find a matching category and type based on existing test_type
            foreach ($categoryMap as $category => $types) {
                if (in_array($screening->test_type, $types)) {
                    $newCategory = $category;
                    $newType = $screening->test_type;
                    break;
                }
            }

            DB::table('screenings')
                ->where('id', $screening->id)
                ->update([
                    'category' => $newCategory,
                    'type' => $newType
                ]);
        });

        // Drop the old test_type column
        Schema::table('screenings', function (Blueprint $table) {
            $table->dropColumn('test_type');
        });
    }

    public function down(): void
    {
        // Drop the added columns
        Schema::table('screenings', function (Blueprint $table) {
            $table->dropColumn(['category', 'type']);
        });
    }
};
