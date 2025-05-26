<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'documents';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'document',
        'title',
        'user_id',
        'consultation_id'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the document.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter documents by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get the document's file path or URL.
     */
    public function getDocumentUrlAttribute()
    {
        if ($this->document) {
            return asset('storage/documents/' . $this->document);
        }
        return null;
    }
}
