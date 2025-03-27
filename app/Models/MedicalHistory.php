<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'congenital_disease',
        'general_disease',
        'surgery',
        'allergy',
        'description',
        'date'
    ];



    public function patient()
{
    return $this->belongsTo(Patient::class, 'patient_id');
}
}
