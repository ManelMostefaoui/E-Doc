<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'condition',
        'date_appeared',
        'severity',
        'implication',
        'treatment',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
