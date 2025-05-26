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
            'type' => 'appointment_cancelled',
            'message' => 'Your appointment scheduled for ' . $this->appointment->scheduled_at . ' has been cancelled by the doctor.',
            'data' => [
                'appointment_id' => $this->appointment->id,
                'consultation_request_id' => $this->appointment->consultation_request_id,
                'scheduled_at' => $this->appointment->scheduled_at
            ]
        ];
    }
}