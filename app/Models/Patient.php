<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'blood_group', 'social_security_no', 'family_status'];

    public function biometricData()
    {
        return $this->hasOne(BiometricData::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicalHistory()
    {
    return $this->hasOne(MedicalHistory::class, 'patient_id');
    }

    protected static function boot()
{
    parent::boot();

    static::created(function ($patient) {
        $patient->biometricData()->create([
            'height' => null, // Valeurs par défaut
            'weight' => null,
        ]);
    });
}

}
