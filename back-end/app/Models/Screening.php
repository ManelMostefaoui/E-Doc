<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Screening extends Model
{
    protected $fillable = ['patient_id', 'test_type', 'result'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
