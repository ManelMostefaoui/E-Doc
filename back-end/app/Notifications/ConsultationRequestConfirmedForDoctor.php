<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class ConsultationRequestConfirmedForDoctor extends Notification
{
    private $consultationRequest;

    public function __construct($consultationRequest)
    {
        $this->consultationRequest = $consultationRequest;
    }

    public function via($notifiable)
    {
        return ['database'];  // Utilisation de la base de données pour envoyer la notification
    }

    public function toDatabase($notifiable)
    {
        return [
            'message' => 'Le patient a confirmé sa demande de consultation.',
            'consultation_request_id' => $this->consultationRequest->id,
            'patient_id' => $this->consultationRequest->patient_id,
            'status' => $this->consultationRequest->status,
            'created_at' => now(),
        ];
    }
}
