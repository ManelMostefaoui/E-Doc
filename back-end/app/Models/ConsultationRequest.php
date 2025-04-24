<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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
}
