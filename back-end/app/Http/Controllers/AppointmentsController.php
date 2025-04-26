<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\appointments;
use App\Models\ConsultationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentsController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'consultation_request_id' => 'required|exists:consultation_requests,id',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'duration' => 'required|integer',
        ]);

        $scheduledAt = $request->input('date') . ' ' . $request->input('time');

        // Create the appointment
        $appointment = appointments::create([
            'consultation_request_id' => $request->consultation_request_id,
            'scheduled_at' => $scheduledAt,
            'duration' => $request->duration,
        ]);

        // Update the request status
        $requestModel = ConsultationRequest::find($request->consultation_request_id);
        $requestModel->status = 'scheduled';
        $requestModel->appointment_date = $scheduledAt;
        $requestModel->save();

        return response()->json([
            'message' => 'Appointment scheduled successfully!',
            'appointment' => $appointment
        ]);
    }
    public function show($id)
    {
        $appointment = appointments::with('consultationRequest')->findOrFail($id);

        return response()->json($appointment);
    }
    public function cancel($id)
    {
        // Find the appointment
        $appointment = appointments::findOrFail($id);

        // Update appointment status
        $appointment->status = 'cancelled';
        $appointment->save();

        // Optional: update the related consultation request status
        $consultationRequest = $appointment->consultationRequest;
        if ($consultationRequest) {
            $consultationRequest->status = 'pending';
            $consultationRequest->appointment_date = null;
            $consultationRequest->save();
        }

        return response()->json([
            'message' => 'Appointment cancelled successfully!',
            'appointment' => $appointment
        ]);
    }
    // App\Http\Controllers\Api\AppointmentsController.php



    public function confirm($id)
    {
        $appointment = appointments::findOrFail($id);


        $user = auth::user();
        if (!$user || !$user->patient || $appointment->consultationRequest->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update consultation request status to 'confirmed'
        $consultationRequest = $appointment->consultationRequest;
        $consultationRequest->status = 'confirmed';
        $consultationRequest->save();

        return response()->json([
            'message' => 'Appointment confirmed successfully!',
            'status' => 'confirmed'
        ]);
    }
    public function cancelbypatient($id)
    {
        $appointment = appointments::findOrFail($id);

        // Make sure the authenticated user is the owner (patient)
        $user = auth::user();
        if (!$user || !$user->patient || $appointment->consultationRequest->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update the consultation request status to 'cancelled'
        $consultationRequest = $appointment->consultationRequest;
        $consultationRequest->status = 'cancelled';
        $consultationRequest->save();

        return response()->json([
            'message' => 'Appointment cancelled successfully!',
            'status' => 'cancelled'
        ]);
    }
}
