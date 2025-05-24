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
            '*' => 'required|array',
            '*.condition' => 'required|in:congenital,general_disease,surgery,allergy',
            '*.date_appeared' => 'nullable|date',
            '*.severity' => 'nullable|in:mild,moderate,severe',
            '*.implication' => 'nullable|string',
            '*.treatment' => 'nullable|string',
        ]);

        $histories = [];
        foreach ($request->all() as $item) {
            $item['patient_id'] = $patientId;
            $histories[] = MedicalHistory::create($item);
        }

        return response()->json([
            'message' => 'Medical histories added successfully',
            'data' => $histories
        ]);
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