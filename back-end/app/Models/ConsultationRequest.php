<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Notifications\NewConsultationRequestNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class ConsultationRequest extends Model
{
    use HasFactory;

    // Spécifier les colonnes qui peuvent être remplies (mass assignable)
    protected $fillable = [
        'patient_id',
        'message',
        'status',
        'appointment_date',
    ];

    // Relation avec le modèle User (pour le patient)
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    public function appointment()
    {
        return $this->hasOne(appointments::class, 'consultation_request_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($consultationRequest) {
            // Get all doctors
            $doctors = User::whereHas('role', function ($query) {
                $query->where('name', 'doctor');
            })->get();

            // Send notification to each doctor
            foreach ($doctors as $doctor) {
                $doctor->notify(new NewConsultationRequestNotification($consultationRequest));
            }
        });
    }
}
