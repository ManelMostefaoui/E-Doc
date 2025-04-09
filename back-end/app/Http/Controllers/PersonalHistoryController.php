<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PersonalHistory;


class PersonalHistoryController extends Controller
{



    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
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

        PersonalHistory::create($validated);

        return response()->json(['message' => 'Personal history saved successfully.']);
    }
}
