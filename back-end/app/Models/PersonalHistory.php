<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PersonalHistory extends Model
{
    use HasFactory;

    protected $table = 'personal_history';

    protected $fillable = [
        'patient_id',
        'smoker',
        'cigarette_count',
        'chewing_tobacco',
        'chewing_tobacco_count',
        'first_use_age',
        'former_smoker',
        'exposure_period',
        'alcohol',
        'medications',
        'other',
    ];

    /**
     * Relationship: A personal history belongs to a patient.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
