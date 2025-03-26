<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BiometricData extends Model
{
    use HasFactory;

    protected $table = 'biometric_data';

    protected $fillable = ['patient_id', 'height', 'weight'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
