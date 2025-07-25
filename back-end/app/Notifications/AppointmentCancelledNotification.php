<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\appointments;

class AppointmentCancelledNotification extends Notification
{
    use Queueable;

    protected $appointment;
    protected $doctor;

    public function __construct(appointments $appointment, $doctor)
    {
        $this->appointment = $appointment;
        $this->doctor = $doctor;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'appointment_cancelled',
            'message' => "Your appointment scheduled for {$this->appointment->scheduled_at} has been cancelled by Dr. {$this->doctor->name}.",
            'data' => [
                'appointment_id' => $this->appointment->id,
                'consultation_request_id' => $this->appointment->consultation_request_id,
                'scheduled_at' => $this->appointment->scheduled_at,
                'cancelled_by' => [
                    'id' => $this->doctor->id,
                    'name' => $this->doctor->name,
                    'role' => $this->doctor->role->name
                ]
            ]
        ];
    }
}
