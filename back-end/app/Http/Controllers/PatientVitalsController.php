<?php

namespace App\Http\Controllers;

use App\Models\PatientVitals;
use Illuminate\Http\Request;

class PatientVitalsController extends Controller
{
    public function store(Request $request)
    {

        $validated = $request->validate(
            [
                'patient_id' => 'required|exists:patients,id',
                'vital_date' => 'nullable|date',
                'full_name' => 'required|string',
                'Age' => 'required|integer',
                'height' => 'required|integer',
                'weight' => 'required|integer',
                'blood_pressure' => 'nullable|integer',
                'temperature' => 'nullable|integer',
                'heart_rate' => 'nullable|integer',
                'blood_sugar' => 'nullable|integer',
                'other_observations' => 'nullable|string',
            ]
        );
        PatientVitals::create($validated);
        return response()->json(['message' => 'Patient vitals saved successfully.']);
    }
    public function update(Request $request, $id)
    {
        $patientVital = PatientVitals::findOrFail($id);

        $validated = $request->validate(
            [
                'patient_id' => 'required|exists:patients,id',
                'vital_date' => 'nullable|date',
                'full_name' => 'required|string',
                'Age' => 'required|integer',
                'height' => 'required|integer',
                'weight' => 'required|integer',
                'blood_pressure' => 'nullable|integer',
                'temperature' => 'nullable|integer',
                'heart_rate' => 'nullable|integer',
                'blood_sugar' => 'nullable|integer',
                'other_observations' => 'nullable|string',
            ]
        );

        $patientVital->update($validated);

        return response()->json(['message' => 'Patient vitals updated successfully.']);
    }
    public function show($id)
    {
        $patientVital = PatientVitals::findOrFail($id);
        if (!$patientVital) {
            return response()->json(['message' => 'Personal history not found.'], 404);
        }
        return response()->json($patientVital);
    }
}
