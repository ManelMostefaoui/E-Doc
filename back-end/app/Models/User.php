<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'gender',
        'birthdate',
        'phone_num',
        'address'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    // Define the relationship (User belongs to a Role)
    public

    function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }



    // Helper method to check the user's role
    public function hasRole($roleName)
    {
        return optional($this->role)->name === $roleName;
    }

    // Relation avec les demandes de consultation (un utilisateur peut avoir plusieurs demandes)
    public function consultationRequests()
    {
        return $this->hasManyThrough(ConsultationRequest::class, Patient::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class, 'user_id'); // user_id est la clé étrangère dans la table patients
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function isDoctor()
    {
        return $this->role === 'doctor'; // Vérifie si le rôle de l'utilisateur est 'doctor'
    }
}
