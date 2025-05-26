<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class appointments extends Model
{
    protected $fillable = [
        'consultation_request_id',
        'scheduled_at',
        'duration',
        'status',
    ];

    public function consultationRequest()
    {
        return $this->belongsTo(ConsultationRequest::class);
    }
}
