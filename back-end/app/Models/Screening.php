<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Screening extends Model
{
    protected $fillable = ['patient_id', 'category', 'type', 'result'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public static function getTypesByCategory($category)
    {
        $types = [
            'cardiologist' => ['Hypertension artérielle', 'Embolie pulmonaire'],
            'ophthalmologist' => ['Cornea', 'retina'],
            'gynecologist' => ['OB-GYNs', 'Urogynecologist', 'GNY-B']
        ];

        return $types[$category] ?? [];
    }
}
