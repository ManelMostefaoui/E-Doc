<?php

namespace App\Imports;

use App\Models\Medication;
use Maatwebsite\Excel\Concerns\ToModel;

class MedicationsImport implements ToModel
{
    /**
     * Transform each row of the spreadsheet into a Medication model.
     *
     * @param array $row
     * @return Medication
     */
    public function model(array $row)
    {
        return new Medication([
            'name' => $row[0],  // Le nom du médicament dans la première colonne
            'category' => $row[1],  // La catégorie du médicament dans la deuxième colonne
            'dosage' => $row[2],  // Le dosage dans la troisième colonne
        ]);
    }
}
