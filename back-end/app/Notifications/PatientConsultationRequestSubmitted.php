<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class PatientConsultationRequestSubmitted extends Notification
{
    private $consultationRequest;

    public function __construct($consultationRequest)
    {
        $this->consultationRequest = $consultationRequest;
    }

    public function via($notifiable)
    {
        return ['database'];  // Nous envoyons la notification via la base de données
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => 'Votre demande de consultation a été envoyée avec succès.',
            'consultation_request_id' => $this->consultationRequest->id,
            'patient_id' => $this->consultationRequest->patient_id,
            'status' => $this->consultationRequest->status,
        ];
    }
}
