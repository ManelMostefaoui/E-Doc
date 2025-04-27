<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Patient;
use Illuminate\Http\Request;

class ScreeningController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'test_type' => 'required|string',
            'result' => 'nullable|string',
        ]);

        // Check if patient is archived
        $patient = Patient::findOrFail($validated['patient_id']);
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot add screening for archived patient'], 403);
        }

        Screening::create($validated);

        return response()->json(['message' => 'Screening created successfully.']);
    }

    public function update(Request $request, $id)
    {
        $screening = Screening::findOrFail($id);

        // Check if patient is archived
        if ($screening->patient->is_archived) {
            return response()->json(['message' => 'Cannot update screening for archived patient'], 403);
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'test_type' => 'required|string',
            'result' => 'required|string',
        ]);

        $screening->update($validated);

        return response()->json(['message' => 'Screening updated successfully.']);
    }

    function show($id)
    {
        $screening = Screening::with('patient')->findOrFail($id);

        // Check if patient is archived
        if ($screening->patient->is_archived) {
            return response()->json(['message' => 'Cannot view screening for archived patient'], 403);
        }

        return response()->json($screening);
    }
}
