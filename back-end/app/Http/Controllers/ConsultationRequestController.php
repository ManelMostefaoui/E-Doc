<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ConsultationRequest;
use Illuminate\Support\Facades\Log;
use App\Models\Role;
use App\Models\User;
use App\Notifications\PatientConsultationRequestSubmitted;
use App\Notifications\ConsultationRequestSubmitted;
use App\Notifications\AppointmentScheduledForDoctor;
use App\Notifications\AppointmentScheduledForPatient;
use App\Notifications\ConsultationRequestConfirmedForDoctor;
use App\Notifications\ConsultationRequestCancelledForDoctor;
use App\Jobs\SendAppointmentReminderForPatient;
use Carbon\Carbon;



class ConsultationRequestController extends Controller
{
    public function submitRequest(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:255',
        ]);
        $user = auth()->user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['message' => 'L\'utilisateur n\'a pas de patient associé.'], 400);
        }

        $consultationRequest = ConsultationRequest::create([
            'patient_id' => $patient->id,
            'message' => $request->message,
            'status' => 'pending', // Le statut initial est "pending"
        ]);

        // Envoyer une notification au patient
        $user->notify(new PatientConsultationRequestSubmitted($consultationRequest));

        // Récupérer tous les médecins

        $doctors = User::whereHas('role', function ($query) {
            $query->where('name', 'doctor');  // Utilise 'name' au lieu de 'role' si la colonne s'appelle 'name'
        })->get();  // Récupérer tous les médecins

        // Envoyer la notification à tous les médecins
        foreach ($doctors as $doctor) {
            $doctor->notify(new ConsultationRequestSubmitted($consultationRequest));
        }

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
        $user = auth()->user();

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
        foreach ($doctors as $doctor) {
        $doctor->notify(new ConsultationRequestConfirmedForDoctor($consultationRequest));  // Envoi de la notification à chaque médecin
    }

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
    $user = auth()->user();
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
    foreach ($doctors as $doctor) {
        $doctor->notify(new ConsultationRequestCancelledForDoctor($consultationRequest));  // Envoi de la notification
    }

    return response()->json([
        'message' => 'Demande annulée avec succès',
        'data' => $consultationRequest,
    ]);
}



public function scheduleAppointment(Request $request, $id)
{
    // Vérifier si l'utilisateur est authentifié et s'il est un médecin
    $user = auth()->user();
    if (!$user || !$user->hasRole('doctor')) { // Assurer que l'utilisateur est bien un médecin
        return response()->json(['message' => 'Utilisateur non autorisé à fixer une date'], 403);
    }

    // Trouver la demande de consultation par son ID
    $consultationRequest = ConsultationRequest::find($id);
    if (!$consultationRequest) {
        return response()->json(['message' => 'Demande non trouvée'], 404);
    }

    // Vérifier si le statut est "pending" (en attente)
    if ($consultationRequest->status !== 'pending') {
        return response()->json(['message' => 'Le statut de la demande n\'est pas en attente'], 400); // Le médecin ne peut fixer une date que si la demande est en attente
    }

    // Valider la date du rendez-vous
    $request->validate([
        'appointment_date' => 'required|date|after:today', // La date doit être dans le futur
    ]);

    // Fixer la date du rendez-vous et mettre à jour le statut
    $consultationRequest->update([
        'appointment_date' => $request->appointment_date,
        'status' => 'scheduled', // Passer le statut à "scheduled"
    ]);

    // Envoyer la notification au médecin
    $user->notify(new AppointmentScheduledForDoctor($consultationRequest));

    // Envoyer la notification au patient
    $patientUser = $consultationRequest->patient->user; // Récupérer l'utilisateur du patient

    // Vérifier si l'utilisateur existe (dans le cas où il n'y a pas de lien avec un user)
    if ($patientUser) {
        // Envoyer la notification au patient
        $patientUser->notify(new AppointmentScheduledForPatient($consultationRequest));
         // Planifier l'envoi de la notification de rappel 24 heures avant la consultation
         $reminderTime = Carbon::parse($consultationRequest->appointment_date)->subMinutes(5);  // 24 heures avant le rendez-vous
         SendAppointmentReminderForPatient::dispatch($consultationRequest)->delay($reminderTime);  // Planifier le job pour 24 heures avant le rendez-vous
    } else {
        // Si aucun utilisateur n'est associé au patient, retourner une erreur ou effectuer une autre action
        return response()->json(['message' => 'Aucun utilisateur associé au patient'], 404);
    }
    // envoi notification avant 24h


    // Retourner une réponse de succès
    return response()->json([
        'message' => 'Rendez-vous programmé avec succès!',
        'data' => $consultationRequest,
    ]);
}


    public function updateAppointmentDate(Request $request, $id)
    {
    // Vérifier si l'utilisateur est authentifié et s'il est un médecin
    $user = auth()->user();
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


}
