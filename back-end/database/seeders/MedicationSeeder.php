<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Medication;
use Faker\Factory as Faker;

class MedicationSeeder extends Seeder
{
    public function run()
    {
        Medication::create([
            'name' => 'Paracetamol',
            'category' => 'Analgesic',
            'dosage' => '500mg'
        ]);

        Medication::create([
            'name' => 'Amoxicillin',
            'category' => 'Antibiotic',
            'dosage' => '250mg'
        ]);

        Medication::create([
            'name' => 'Ibuprofen',
            'category' => 'Anti-inflammatory',
            'dosage' => '400mg'
        ]);

        $faker = Faker::create();
        for ($i = 0; $i < 20; $i++) {
            Medication::create([
                'name' => $faker->word,  // Générer un nom aléatoire
                'category' => $faker->word,  // Générer une catégorie aléatoire
                'dosage' => $faker->randomElement(['500mg', '250mg', '100mg', '1g']), // Générer un dosage aléatoire
            ]);
    }
}
}
