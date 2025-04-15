<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Medication;
use Faker\Factory as Faker;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MedicationsImport;

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
        //Import excel
            $filePath = public_path('medicaments.xlsx');

            Excel::import(new MedicationsImport, $filePath);


}
}
