<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ConsultationRequest;
use App\Models\User;

class ConsultationRequestCancelledNotification extends Notification
{
    use Queueable;

    protected $consultationRequest;
    protected $doctor;

    public function __construct(ConsultationRequest $consultationRequest, User $doctor)
    {
        $this->consultationRequest = $consultationRequest;
        $this->doctor = $doctor;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'consultation_request_cancelled',
            'message' => "Your consultation request has been cancelled by Dr. {$this->doctor->name}.",
            'data' => [
                'consultation_request_id' => $this->consultationRequest->id,
                'cancelled_by' => [
                    'id' => $this->doctor->id,
                    'name' => $this->doctor->name,
                    'role' => $this->doctor->role->name
                ]
            ]
        ];
    }
}
