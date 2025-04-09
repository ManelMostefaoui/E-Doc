<?php

namespace App\Models;

use App\Http\Controllers\BiometricDataController;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'blood_group', 'social_security_no', 'family_status'];

    public function biometricData()
    {
        return $this->hasOne(
            BiometricData::class
        );
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicalHistories()
    {
        return $this->hasMany(MedicalHistory::class);
    }

    public function screenings()
    {
        return $this->hasMany(Screening::class);
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
