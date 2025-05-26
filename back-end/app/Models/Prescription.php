<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'date',
        'full_name',
        'age',
    ];

    public function medications()
    {
        return $this->belongsToMany(Medication::class, 'medication_prescription')
            ->withPivot(['dose', 'period'])
            ->withTimestamps();
    }
}
