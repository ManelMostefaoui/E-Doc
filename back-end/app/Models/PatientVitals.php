<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientVitals extends Model
{
    protected $fillable = [
   
        'full_name',
        'Age',
        'height',
        'weight',
        'blood_pressure',
        'temperature',
        'heart_rate',
        'blood_sugar',
        'other_observations'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
