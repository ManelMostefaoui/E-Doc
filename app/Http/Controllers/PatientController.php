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

    public function show($id)
    {
        // Récupérer le patient avec ses infos
        $patient = Patient::where('id', $id)
            ->with(['user', 'biometricData'])
            ->first();

        // Vérifier si le patient existe
        if (!$patient) {
            return response()->json(['message' => 'Patient not found'], 404);
        }

        // Retourner les données du patient
        return response()->json([
            'id' => $patient->id,
            'name' => $patient->user->name,
            'email' => $patient->user->email,
            'birthdate' => $patient->user->birthdate,
            'phone_num' => $patient->user->phone_num,
            'address' => $patient->user->address,
            'blood_group' => $patient->blood_group,
            'family_status' => $patient->family_status,
            'social_security_no' => $patient->social_security_no,
            'weight' => $patient->biometricData->weight ?? null,
            'height' => $patient->biometricData->height ?? null,
            'created_at' => $patient->created_at,
        ], 200);
    }

}
