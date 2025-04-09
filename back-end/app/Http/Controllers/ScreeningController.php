<?php

namespace App\Http\Controllers;

use App\Models\Screening;
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

        Screening::create($validated);

        return response()->json(['message' => 'Screening created successfully.']);
    }
    public function update(Request $request, $id)
    {
        $screening = Screening::findOrFail($id);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'test_type' => 'required|string',
            'result' => 'required|string',
        ]);

        $screening->update($validated);

        return response()->json(['message' => 'Screening updated successfully.']);
    }
}
