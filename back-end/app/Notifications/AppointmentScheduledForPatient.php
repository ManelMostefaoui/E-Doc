<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AppointmentScheduledForPatient extends Notification
{
    private $consultationRequest;

    public function __construct($consultationRequest)
    {
        $this->consultationRequest = $consultationRequest;
    }

    public function via($notifiable)
    {
        return ['database'];  // Utilisation de la base de données pour stocker la notification
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => 'Votre rendez-vous a été programmé avec succès.',
            'consultation_request_id' => $this->consultationRequest->id,
            'patient_id' => $this->consultationRequest->patient_id,
            'scheduled_at' => $this->consultationRequest->scheduled_at,  // Date et heure du rendez-vous
            'status' => $this->consultationRequest->status,
            'created_at' => now(),
        ];
    }
}
