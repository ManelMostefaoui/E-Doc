<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\User;

class PatientController extends Controller
{
    //
    public function update(Request $request, Patient $patient)
    {
        $request->validate([
            'blood_group' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'social_security_no' => 'nullable|string|unique:patients,social_security_no,' . $patient->id,
            'family_status' => 'nullable|in:Single,Married,Divorced,Widowed',
        ]);

        $patient->update([
            'blood_group' => $request->blood_group,
            'social_security_no' => $request->social_security_no,
            'family_status' => $request->family_status,
        ]);

        return response()->json([
            'message' => 'Patient information updated successfully',
            'patient' => $patient
        ], 200);
    }


}
