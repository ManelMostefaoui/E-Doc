<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class ConsultationRequestSubmitted extends Notification
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
            'message' => 'Un patient a soumis une demande de consultation.',
            'consultation_request_id' => $this->consultationRequest->id,
            'patient_id' => $this->consultationRequest->patient_id,
            'status' => $this->consultationRequest->status,
        ];
    }
}
