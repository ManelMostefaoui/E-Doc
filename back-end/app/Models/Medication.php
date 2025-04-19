<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medication extends Model
{
    protected $fillable = [
        'name',
        'category',
        'dosage',
    ];
    public function prescriptions()
    {
        return $this->belongsToMany(Prescription::class, 'medication_prescription')
            ->withPivot(['dose', 'period'])
            ->withTimestamps();
    }
}
