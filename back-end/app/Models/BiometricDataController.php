<?php

namespace App\Http\Controllers;

use App\Models\BiometricData;
use App\Models\Patient;
use Illuminate\Http\Request;

class BiometricDataController extends Controller
{
    public function update(Request $request, $patient_id)
    {
        $request->validate([
            'height' => 'nullable|numeric|min:50|max:250',
            'weight' => 'nullable|numeric|min:10|max:500',
        ]);

        // Vérifier si le patient existe
        $patient = Patient::findOrFail($patient_id);

        // Mettre à jour ou créer les données biométriques
        $biometricData = BiometricData::updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'height' => $request->input('height'),
                'weight' => $request->input('weight'),
            ]
        );

        return response()->json([
            'message' => 'Données biométriques mises à jour avec succès.',
            'data' => $biometricData
        ], 200);
    }
}
