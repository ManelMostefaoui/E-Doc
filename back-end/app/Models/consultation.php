<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class consultation extends Model
{
    use HasFactory;

    protected $table = 'consultation';

    protected $fillable = [
        'patient_vitals_id',
        'prescription_id',
    ];

    /**
     * Relationship to PatientVitals
     */
    public function patientVitals()
    {
        return $this->belongsTo(PatientVitals::class);
    }

    /**
     * Relationship to Prescription
     */
    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }
}
