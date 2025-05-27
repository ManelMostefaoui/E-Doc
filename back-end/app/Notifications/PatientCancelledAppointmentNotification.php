<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\appointments;

class PatientCancelledAppointmentNotification extends Notification
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
        $patient = $this->appointment->consultationRequest->patient->user;
        return [
            'type' => 'patient_cancelled_appointment',
            'message' => "Patient {$patient->name} has cancelled their appointment scheduled for {$this->appointment->scheduled_at}",
            'data' => [
                'appointment_id' => $this->appointment->id,
                'consultation_request_id' => $this->appointment->consultation_request_id,
                'scheduled_at' => $this->appointment->scheduled_at,
                'patient_name' => $patient->name,
                'patient_role' => $patient->role->name
            ]
        ];
    }
}
