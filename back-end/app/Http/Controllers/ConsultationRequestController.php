<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ConsultationRequest;
use Illuminate\Support\Facades\Log;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Notifications\ConsultationRequestCancelledNotification;



class ConsultationRequestController extends Controller
{
    public function submitRequest(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:255',
        ]);
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['message' => 'L\'utilisateur n\'a pas de patient associé.'], 400);
        }

        $consultationRequest = ConsultationRequest::create([
            'patient_id' => $patient->id,
            'message' => $request->message,
            'status' => 'pending', // Le statut initial est "pending"
        ]);


        // Récupérer tous les médecins

        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');  // Utilise 'name' au lieu de 'role' si la colonne s'appelle 'name'
        })->get();  // Récupérer tous les médecins


        // Retourner une réponse de succès
        return response()->json([
            'message' => 'Demande soumise avec succès!',
            'data' => $consultationRequest,
        ]);
    }


    public function confirmRequest($id)
    {
        // Trouver la demande de consultation par son ID
        $consultationRequest = ConsultationRequest::find($id);
        if (!$consultationRequest) {
            return response()->json(['message' => 'Demande de consultation non trouvée'], 404);
        }

        // Vérifier si l'utilisateur authentifié est bien le patient de cette demande
        $user =  Auth::user();

        // Récupérer le modèle Patient associé à l'utilisateur authentifié
        $patient = $user->patient; // Assure-toi que l'utilisateur a un modèle Patient associé

        // Comparer l'ID du patient avec le patient_id de la demande de consultation
        if ($consultationRequest->patient_id !== $patient->id) {
            return response()->json(['message' => 'Ce n\'est pas votre demande à confirmer'], 403);
        }

        if (is_null($consultationRequest->appointment_date)) {
            return response()->json(['message' => 'Vous ne pouvez pas confirmer la demande avant que le médecin fixe une date de rendez-vous.'], 400);
        }

        // Vérifier que la demande est toujours en statut "pending"
        if ($consultationRequest->status !== 'scheduled') {
            return response()->json(['message' => 'Le statut de la demande n\'est pas en attente'], 400); // Le patient peut confirmer uniquement si la demande est en attente
        }

        // Changer le statut de la demande à "confirmed"
        $consultationRequest->status = 'confirmed';
        $consultationRequest->save();

        // Envoyer une notification au médecin que la demande est confirmée
        // Récupérer tous les utilisateurs ayant le rôle 'doctor'
        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');  // Filtrer les utilisateurs avec le rôle 'doctor'
        })->get();

        // Envoi de la notification à chaque médecin


        return response()->json([
            'message' => 'Demande confirmée avec succès',
            'data' => $consultationRequest,
        ]);
    }





    public function cancelRequest($id)
    {
        // Trouver la demande de consultation par son ID
        $consultationRequest = ConsultationRequest::find($id);
        if (!$consultationRequest) {
            return response()->json(['message' => 'Demande de consultation non trouvée'], 404);
        }

        // Vérifier si l'utilisateur authentifié est bien le patient de cette demande
        $user =  Auth::user();
        $patient = $user->patient;

        // Comparer l'ID du patient avec le patient_id de la demande de consultation
        if ($consultationRequest->patient_id !== $patient->id) {
            return response()->json(['message' => 'Ce n\'est pas votre demande à annuler'], 403);
        }

        // Changer le statut de la demande à "cancelled"
        $consultationRequest->status = 'cancelled';
        $consultationRequest->save();

        // Récupérer tous les médecins ayant le rôle 'doctor'
        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');
        })->get();

        // Envoi de la notification à chaque médecin

        return response()->json([
            'message' => 'Demande annulée avec succès',
            'data' => $consultationRequest,
        ]);
    }



    public function scheduleAppointment(Request $request, $id)
    {
        // Vérifier si l'utilisateur est authentifié et s'il est un médecin
        $user =  Auth::user();
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json(['message' => 'Utilisateur non autorisé à fixer une date'], 403);
        }

        // Trouver la demande de consultation par son ID
        $consultationRequest = ConsultationRequest::find($id);
        if (!$consultationRequest) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        // Vérifier si le statut est "pending" (en attente)
        if ($consultationRequest->status !== 'pending') {
            return response()->json(['message' => 'Le statut de la demande n\'est pas en attente'], 400);
        }

        // Valider la date du rendez-vous
        $request->validate([
            'appointment_date' => 'required|date|after:today',
        ]);

        // Fixer la date du rendez-vous et mettre à jour le statut
        $consultationRequest->update([
            'appointment_date' => $request->appointment_date,
            'status' => 'scheduled',
        ]);


        // Envoyer la notification au patient
        $patientUser = $consultationRequest->patient->user;

        if ($patientUser) {
            $patientUser->notify(new AppointmentScheduledForPatient($consultationRequest));
        } else {
            return response()->json(['message' => 'Aucun utilisateur associé au patient'], 404);
        }

        return response()->json([
            'message' => 'Rendez-vous programmé avec succès!',
            'data' => $consultationRequest,
        ]);
    }


    public function updateAppointmentDate(Request $request, $id)
    {
        // Vérifier si l'utilisateur est authentifié et s'il est un médecin
        $user =  Auth::user();
        if (!$user || !$user->hasRole('doctor')) { // Assurer que l'utilisateur est bien un médecin
            return response()->json(['message' => 'Utilisateur non autorisé à modifier la date'], 403);
        }

        // Trouver la demande de consultation par son ID
        $consultationRequest = ConsultationRequest::find($id);
        if (!$consultationRequest) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        // Vérifier si le statut est "scheduled" (programmé)
        if ($consultationRequest->status !== 'scheduled') {
            return response()->json(['message' => 'La date ne peut être modifiée que si le statut est "programmé"'], 400);
        }

        // Valider la nouvelle date du rendez-vous
        $request->validate([
            'appointment_date' => 'required|date|after:today', // La date doit être dans le futur
        ]);

        // Mettre à jour la date du rendez-vous
        $consultationRequest->update([
            'appointment_date' => $request->appointment_date, // Mettre à jour la date
        ]);

        // Retourner une réponse de succès
        return response()->json([
            'message' => 'Date du rendez-vous modifiée avec succès!',
            'data' => $consultationRequest,
        ]);
    }

    public function getConsultationsByStatus(Request $request)
    {
        // Verify if user is a doctor
        $user =  Auth::user();
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $status = $request->query('status');

        // Validate status parameter
        $validStatuses = ['pending', 'scheduled', 'cancelled', 'confirmed'];
        if ($status && !in_array($status, $validStatuses)) {
            return response()->json(['message' => 'Invalid status parameter'], 400);
        }

        // Build the query
        $query = ConsultationRequest::with(['patient.user']);

        // Apply status filter if provided
        if ($status) {
            $query->where('status', $status);
        }

        // Get the results ordered by latest first
        $consultations = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Consultations retrieved successfully',
            'data' => $consultations
        ]);
    }

    public function getUserConsultations()
    {
        $user = Auth::user();

        // Check if user has an associated patient record
        if (!$user->patient) {
            return response()->json([
                'message' => 'User does not have an associated patient record',
                'error' => 'Unauthorized'
            ], 403);
        }

        // Get all consultation requests for this patient with related appointment
        $consultations = ConsultationRequest::where('patient_id', $user->patient->id)
            ->with('appointment:id,consultation_request_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'patient_id' => $consultation->patient_id,
                    'message' => $consultation->message,
                    'status' => $consultation->status,
                    'appointment_date' => $consultation->appointment_date,
                    'created_at' => $consultation->created_at,
                    'updated_at' => $consultation->updated_at,
                    'appointment_id' => $consultation->appointment ? $consultation->appointment->id : null
                ];
            });

        return response()->json([
            'message' => 'Historique des consultations récupéré avec succès',
            'data' => $consultations
        ]);
    }

    public function getConsultationStatsByDay(Request $request)
    {
        $user =  Auth::user();

        // Check if user is doctor
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les médecins peuvent voir ces statistiques.',
                'error' => 'Unauthorized'
            ], 403);
        }

        // Get month and year from request, default to current month and year
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        // Validate month and year
        if (!is_numeric($month) || $month < 1 || $month > 12) {
            return response()->json([
                'message' => 'Le mois spécifié est invalide',
                'error' => 'Invalid month'
            ], 400);
        }

        if (!is_numeric($year) || $year < 2000 || $year > 2100) {
            return response()->json([
                'message' => 'L\'année spécifiée est invalide',
                'error' => 'Invalid year'
            ], 400);
        }

        // Set the start and end dates for the specified month
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Get consultations grouped by appointment date and status for the current doctor
        $stats = ConsultationRequest::whereBetween('appointment_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(appointment_date) as date'),
                'status',
                DB::raw('COUNT(*) as count')
            )
            ->whereIn('status', ['confirmed', 'cancelled'])
            ->where(function ($query) {
                $query->whereNotNull('appointment_date');
            })
            ->groupBy('date', 'status')
            ->orderBy('date', 'desc')
            ->get();

        // Format the data for response
        $formattedStats = [];
        foreach ($stats as $stat) {
            $date = $stat->date;
            if (!isset($formattedStats[$date])) {
                $formattedStats[$date] = [
                    'confirmed' => 0,
                    'cancelled' => 0,
                    'date' => $date
                ];
            }
            $formattedStats[$date][$stat->status] = $stat->count;
        }

        // Convert to array and sort by date
        $formattedStats = array_values($formattedStats);

        return response()->json([
            'message' => 'Statistiques des consultations récupérées avec succès',
            'data' => $formattedStats,
            'period' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ]
        ]);
    }

    public function getConfirmedRequestsByDay(Request $request)
    {
        $user =  Auth::user();

        // Check if user is doctor
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les médecins peuvent voir ces détails.',
                'error' => 'Unauthorized'
            ], 403);
        }

        // Get date from request, default to current date
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : Carbon::today();

        // Validate date
        if (!$date->isValid()) {
            return response()->json([
                'message' => 'La date spécifiée est invalide',
                'error' => 'Invalid date'
            ], 400);
        }

        // Get confirmed consultations for the specified date with patient details
        $consultations = ConsultationRequest::with(['patient.user'])
            ->whereDate('appointment_date', $date)
            ->where('status', 'confirmed')
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'time' => Carbon::parse($consultation->appointment_date)->format('H:i'),
                    'patient' => [
                        'full_name' => $consultation->patient->user->name,
                        'email' => $consultation->patient->user->email
                    ],
                    'message' => $consultation->message
                ];
            });

        return response()->json([
            'message' => 'Liste des rendez-vous confirmés récupérée avec succès',
            'date' => $date->format('Y-m-d'),
            'data' => $consultations
        ]);
    }

    public function getMonthlyBookingStatus(Request $request)
    {
        $user =  Auth::user();

        // Check if user is doctor
        if (!$user || !$user->hasRole('doctor')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les médecins peuvent voir ces statistiques.',
                'error' => 'Unauthorized'
            ], 403);
        }

        // Get month and year from request, default to current month and year
        $month = $request->query('month', Carbon::now()->month);
        $year = $request->query('year', Carbon::now()->year);

        // Validate month and year
        if (!is_numeric($month) || $month < 1 || $month > 12) {
            return response()->json([
                'message' => 'Le mois spécifié est invalide',
                'error' => 'Invalid month'
            ], 400);
        }

        if (!is_numeric($year) || $year < 2000 || $year > 2100) {
            return response()->json([
                'message' => 'L\'année spécifiée est invalide',
                'error' => 'Invalid year'
            ], 400);
        }

        // Set the start and end dates for the specified month
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Get confirmed consultations count for each day
        $dailyBookings = ConsultationRequest::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'confirmed')
            ->select(
                DB::raw('DATE(appointment_date) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Prepare the calendar data
        $calendar = [];
        $currentDate = clone $startDate;

        while ($currentDate <= $endDate) {
            $dateStr = $currentDate->format('Y-m-d');
            $bookingCount = isset($dailyBookings[$dateStr]) ? $dailyBookings[$dateStr]->count : 0;

            // Determine booking status
            $status = 'no_appointment'; // Default status (0-5 appointments)
            if ($bookingCount > 10) {
                $status = 'fully_booked';
            } elseif ($bookingCount > 5) {
                $status = 'getting_filled';
            }

            Log::info("Date: {$dateStr}, Count: {$bookingCount}, Status: {$status}");

            $calendar[] = [
                'date' => $dateStr,
                'booking_count' => $bookingCount,
                'status' => $status,
                'color' => [
                    'no_appointment' => '#008080',  // Teal color for few/no appointments
                    'getting_filled' => '#ffd700',  // Yellow color for getting full
                    'fully_booked' => '#c5283d'     // Red color for fully booked
                ][$status]
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'message' => 'Statut des réservations récupéré avec succès',
            'data' => $calendar,
            'period' => [
                'month' => (int)$month,
                'year' => (int)$year,
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ]
        ]);
    }

    public function cancelRequestByDoctor($id)
    {
        // Find the consultation request by ID
        $consultationRequest = ConsultationRequest::with('patient.user')->find($id);
        if (!$consultationRequest) {
            return response()->json(['message' => 'Consultation request not found'], 404);
        }

        // Verify if the authenticated user is a doctor
        $user = Auth::user();
        if (!$user->role || $user->role->name !== 'doctor') {
            return response()->json(['message' => 'Unauthorized. Only doctors can cancel consultation requests'], 403);
        }

        // Check if the request can be cancelled (not already completed or cancelled)
        if ($consultationRequest->status === 'completed' || $consultationRequest->status === 'cancelled') {
            return response()->json(['message' => 'Cannot cancel a completed or already cancelled request'], 400);
        }

        // Update the status to cancelled
        $consultationRequest->status = 'cancelled';
        $consultationRequest->save();

        // Get the patient's user and send notification
        if ($consultationRequest->patient && $consultationRequest->patient->user) {
            $consultationRequest->patient->user->notify(new ConsultationRequestCancelledNotification($consultationRequest, $user));
        } else {
            Log::warning('Could not send notification: Patient or User not found for consultation request #' . $id);
        }

        return response()->json([
            'message' => 'Consultation request cancelled successfully',
            'data' => $consultationRequest
        ]);
    }


    public function show($id)
    {
        $request = ConsultationRequest::with('patient.user')->findOrFail($id);

        return response()->json([
            'id' => $request->id,
            'message' => $request->message,
            'status' => $request->status,
            'appointment_date' => $request->appointment_date,
            'patient' => [
                'name' => $request->patient->user->name,
                'gender' => $request->patient->user->gender,
            ],
        ]);
    }

    public function getPendingRequests()
    {
    // Get consultation requests that are pending and not in appointments table
    $pendingRequests = ConsultationRequest::with(['patient.user'])
        ->where('status', 'pending')
        ->whereNotExists(function ($query) {
            $query->select('consultation_request_id')
                  ->from('appointments')
                  ->whereRaw('consultation_requests.id = appointments.consultation_request_id');
        })
        ->latest('id')  // This ensures ordering by ID in descending order
        ->orderBy('created_at', 'desc')  // Secondary ordering by creation date
        ->get()
        ->map(function ($request) {
            return [
                'id' => $request->id,
                'patient_name' => $request->patient->user->name,
                'message' => $request->message,
                'created_at' => $request->created_at,
                'status' => $request->status
            ];
        });

    return response()->json([
        'message' => 'Pending consultation requests retrieved successfully',
        'data' => $pendingRequests
    ]);
    }
}
