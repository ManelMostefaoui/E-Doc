<?php

namespace App\Http\Controllers;

use App\Models\appointments;
use App\Models\ConsultationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\AppointmentCancelledNotification;
use App\Notifications\PatientCancelledAppointmentNotification;
use App\Notifications\AppointmentScheduledNotification;
use App\Notifications\AppointmentConfirmedNotification;
use App\Models\User;


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

        // Send notification to patient
        $patient = $requestModel->patient->user;
        if ($patient) {
            $patient->notify(new AppointmentScheduledNotification($appointment));
        }

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

        // Check if the authenticated user is a doctor
        $user = auth()->user();
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update appointment status
        $appointment->status = 'cancelled';
        $appointment->save();

        // Optional: update the related consultation request status
        $consultationRequest = $appointment->consultationRequest;
        if ($consultationRequest) {
            $consultationRequest->status = 'pending';
            $consultationRequest->appointment_date = null;
            $consultationRequest->save();

            // Send notification to patient
            $patient = $consultationRequest->patient->user;
            if ($patient) {
                $patient->notify(new AppointmentCancelledNotification($appointment));
            }
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

        $user = auth()->user();
        if (!$user || !$user->patient || $appointment->consultationRequest->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update appointment status
        $appointment->status = 'completed';
        $appointment->save();

        // Update consultation request status to 'confirmed'
        $consultationRequest = $appointment->consultationRequest;
        $consultationRequest->status = 'confirmed';
        $consultationRequest->save();

        // Send notification to doctors
        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');
        })->get();

        foreach ($doctors as $doctor) {
            $doctor->notify(new AppointmentConfirmedNotification($appointment));
        }

        return response()->json([
            'message' => 'Appointment confirmed successfully!',
            'status' => 'confirmed'
        ]);
    }
    public function cancelbypatient($id)
    {
        $appointment = appointments::with('consultationRequest.patient')->findOrFail($id);

        // Make sure the authenticated user is the owner (patient)
        $user = auth()->user();

        // Get the patient associated with the appointment
        $consultationRequest = $appointment->consultationRequest;
        if (!$consultationRequest) {
            return response()->json(['message' => 'Consultation request not found'], 404);
        }

        // Check if the authenticated user is the patient who owns this appointment
        if (!$user || !$user->patient || $consultationRequest->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update appointment status
        $appointment->status = 'cancelled';
        $appointment->save();

        // Update the consultation request status to 'cancelled'
        $consultationRequest->status = 'cancelled';
        $consultationRequest->save();

        // Send notification to doctor
        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');
        })->get();

        foreach ($doctors as $doctor) {
            $doctor->notify(new PatientCancelledAppointmentNotification($appointment));
        }

        return response()->json([
            'message' => 'Appointment cancelled successfully!',
            'status' => 'cancelled'
        ]);
    }

        public function getMonthlyBookingStatus(Request $request)
        {
            // If no month is provided, use current month
            $month = $request->input('month', date('Y-m'));

            // Validate the month format if provided
            if ($request->has('month')) {
                $request->validate([
                    'month' => 'date_format:Y-m',
                ]);
            }

            $startDate = $month . '-01 00:00:00';
            $endDate = date('Y-m-t 23:59:59', strtotime($startDate));

            // Get completed appointments count for each day in the month
            $stats = appointments::whereBetween('scheduled_at', [$startDate, $endDate])
                ->where('status', 'completed')
                ->selectRaw('DATE(scheduled_at) as date')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('date')
                ->get();

            $result = [];
            $currentDate = new \DateTime($startDate);
            $lastDate = new \DateTime($endDate);

            while ($currentDate <= $lastDate) {
                $dateStr = $currentDate->format('Y-m-d');
                $count = 0;

                // Find stats for current date
                $dateStat = $stats->firstWhere('date', $dateStr);
                if ($dateStat) {
                    $count = $dateStat->count;
                }

                // Determine booking status based on completed appointments count
                $status = 'no appointments';
                if ($count >= 10) {
                    $status = 'fully booked';
                } elseif ($count >= 5) {
                    $status = 'getting full';
                }

                $result[] = [
                    'date' => $dateStr,
                    'appointment_count' => $count,
                    'status' => $status
                ];

                $currentDate->modify('+1 day');
            }

            return response()->json([
                'message' => 'Monthly booking status retrieved successfully',
                'month' => $month,
                'data' => $result
            ]);
        }

    public function getMonthlyStats(Request $request)
    {
        // If no month is provided, use current month
        $month = $request->input('month', date('Y-m'));

        // Validate the month format if provided
        if ($request->has('month')) {
            $request->validate([
                'month' => 'date_format:Y-m',
            ]);
        }

        $startDate = $month . '-01 00:00:00';
        $endDate = date('Y-m-t 23:59:59', strtotime($startDate));

        $stats = appointments::whereBetween('scheduled_at', [$startDate, $endDate])
            ->whereIn('status', ['completed', 'cancelled'])
            ->selectRaw('DATE(scheduled_at) as date')
            ->selectRaw('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('date', 'status')
            ->get();

        $result = [];
        $currentDate = new \DateTime($startDate);
        $lastDate = new \DateTime($endDate);

        while ($currentDate <= $lastDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $result[$dateStr] = [
                'date' => $dateStr,
                'completed' => 0,
                'cancelled' => 0
            ];
            $currentDate->modify('+1 day');
        }

        foreach ($stats as $stat) {
            $result[$stat->date][$stat->status] = $stat->count;
        }

        return response()->json([
            'message' => 'Monthly appointment statistics retrieved successfully',
            'month' => $month,
            'data' => array_values($result)
        ]);
    }



    public function getAppointmentsByDay(Request $request)
    {
        // Validate date if provided, otherwise use today
        $date = $request->input('date', now()->format('Y-m-d'));

        if ($request->has('date')) {
            $request->validate([
                'date' => 'date_format:Y-m-d',
            ]);
        }

        $appointments = appointments::with(['consultationRequest' => function($query) {
                $query->with('patient.user');
            }])
            ->whereDate('scheduled_at', $date)
            ->where('status', 'completed')  // Only get completed appointments
            ->orderBy('scheduled_at', 'asc')
            ->get();

        return response()->json([
            'message' => 'Appointments retrieved successfully',
            'date' => $date,
            'appointments' => $appointments
        ]);
    }

    // ... existing code ...
}
