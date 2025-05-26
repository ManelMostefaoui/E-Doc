<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\appointments;

class AppointmentConfirmedNotification extends Notification
{
    use Queueable;

    protected $appointment;

    public function __construct(appointments $appointment)
    {
        $this->appointment = $appointment;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Patient has confirmed the appointment',
            'appointment_id' => $this->appointment->id,
            'patient_name' => $this->appointment->consultationRequest->patient->user->name,
            'scheduled_at' => $this->appointment->scheduled_at,
            'confirmed_at' => now()
        ];
    }
}