<?php

namespace App\Http\Controllers;

use App\Models\MedicalHistory;
use App\Models\Patient;
use Illuminate\Http\Request;

class MedicalHistoryController extends Controller
{
    // 🔍 Afficher les antécédents médicaux d'un patient
    public function store(Request $request, $patientId)
    {
        // Check if patient exists and is not archived
        $patient = Patient::findOrFail($patientId);
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot add medical history to archived patient'], 403);
        }

        $validated = $request->validate([
            'condition' => 'required|in:congenital,general_disease,surgery,allergy',
            'date_appeared' => 'nullable|date',
            'severity' => 'nullable|in:mild,moderate,severe',
            'implication' => 'nullable|string',
            'treatment' => 'nullable|string',
        ]);

        $validated['patient_id'] = $patientId;
        $history = MedicalHistory::create($validated);

        return response()->json(['message' => 'Medical history added successfully', 'data' => $history]);
    }

    public function update(Request $request, $id)
    {
        $history = MedicalHistory::findOrFail($id);

        // Check if patient is not archived
        if ($history->patient->is_archived) {
            return response()->json(['message' => 'Cannot update medical history of archived patient'], 403);
        }

        $validated = $request->validate([
            'condition' => 'nullable|in:congenital,general_disease,surgery,allergy',
            'date_appeared' => 'nullable|date',
            'severity' => 'nullable|in:mild,moderate,severe',
            'implication' => 'nullable|string',
            'treatment' => 'nullable|string',
        ]);

        $history->update($validated);

        return response()->json(['message' => 'Medical history updated successfully', 'data' => $history]);
    }

    public function showPatientHistory($patientId)
    {
        $patient = Patient::with(['medicalHistories' => function ($query) {
            $query->whereNotNull('condition')
                ->orWhereNotNull('date_appeared')
                ->orWhereNotNull('severity')
                ->orWhereNotNull('implication')
                ->orWhereNotNull('treatment');
        }])->find($patientId);

        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        return response()->json([
            'message' => 'Filtered medical history retrieved successfully',
            'data' => $patient->medicalHistories
        ]);
    }
}
