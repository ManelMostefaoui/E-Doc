<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PersonalHistory;
use App\Models\Patient;

class PersonalHistoryController extends Controller
{
    public function store(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        // Check if patient is archived
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot add personal history for archived patient'], 403);
        }

        // Validate the request
        $validated = $request->validate([
            'smoker' => 'nullable|boolean',
            'cigarette_count' => 'nullable|integer',
            'chewing_tobacco' => 'nullable|boolean',
            'chewing_tobacco_count' => 'nullable|integer',
            'first_use_age' => 'nullable|integer',
            'former_smoker' => 'nullable|boolean',
            'exposure_period' => 'nullable|string',
            'alcohol' => 'nullable|string',
            'medications' => 'nullable|string',
            'other' => 'nullable|string',
        ]);

        // Add patient_id manually to the validated data
        $validated['patient_id'] = $patient->id;

        // Create the personal history
        PersonalHistory::create($validated);

        return response()->json(['message' => 'Personal history saved successfully.']);
    }

    public function update(Request $request, $id)
    {
        $personalHistory = PersonalHistory::where('patient_id', $id)->first();

        // Check if patient is archived
        $patient = Patient::findOrFail($personalHistory->patient_id);
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot update personal history for archived patient'], 403);
        }

        $validated = $request->validate([
            'smoker' => 'nullable|boolean',
            'cigarette_count' => 'nullable|integer',
            'chewing_tobacco' => 'nullable|boolean',
            'chewing_tobacco_count' => 'nullable|integer',
            'first_use_age' => 'nullable|integer',
            'former_smoker' => 'nullable|boolean',
            'exposure_period' => 'nullable|string',
            'alcohol' => 'nullable|string',
            'medications' => 'nullable|string',
            'other' => 'nullable|string',
        ]);

        $personalHistory->update($validated);

        return response()->json(['message' => 'Personal history updated successfully.']);
    }

    public function show($id)
    {
        $personalHistory = PersonalHistory::where('patient_id', $id)->first();

        if (!$personalHistory) {
            return response()->json(['message' => 'Personal history not found.'], 404);
        }

        return response()->json($personalHistory);
    }
}
