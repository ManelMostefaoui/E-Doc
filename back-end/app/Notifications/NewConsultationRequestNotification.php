<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ConsultationRequest;

class NewConsultationRequestNotification extends Notification
{
    use Queueable;

    protected $consultationRequest;

    public function __construct(ConsultationRequest $consultationRequest)
    {
        $this->consultationRequest = $consultationRequest;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'New consultation request received',
            'consultation_request_id' => $this->consultationRequest->id,
            'patient_name' => $this->consultationRequest->patient->user->name,
            'requested_at' => $this->consultationRequest->created_at
        ];
    }
}