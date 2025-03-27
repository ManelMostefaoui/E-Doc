<?php

namespace App\Http\Controllers;

use App\Models\MedicalHistory;
use App\Models\Patient;
use Illuminate\Http\Request;

class MedicalHistoryController extends Controller
{
    // 🔍 Afficher les antécédents médicaux d'un patient
    public function show($patientId)
    {
        $medicalHistory = MedicalHistory::where('patient_id', $patientId)->first();

        if (!$medicalHistory) {
            return response()->json(['message' => 'No medical history found for this patient'], 404);
        }

        return response()->json($medicalHistory);
    }

    // 📝 Mettre à jour les antécédents médicaux d'un patient
    public function update(Request $request, $patient_id)
    {
        $request->validate([
            'congenital_disease' => 'nullable|string',
            'general_disease' => 'nullable|string',
            'surgery' => 'nullable|string',
            'allergy' => 'nullable|string',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
        ]);

        $medicalHistory = MedicalHistory::where('patient_id', $patient_id)->first();

        if (!$medicalHistory) {
            return response()->json(['message' => 'Medical history not found'], 404);
        }

        $medicalHistory->update([
            'congenital_disease' => $request->congenital_disease,
            'general_disease' => $request->general_disease,
            'surgery' => $request->surgery,
            'allergy' => $request->allergy,
            'description' => $request->description,
            'date' => $request->date,
        ]);

        return response()->json([
            'message' => 'Medical history updated successfully',
            'data' => $medicalHistory
        ], 200);
    }

}
