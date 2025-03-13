<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
<<<<<<< HEAD
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
=======

class User extends Authenticatable
{
    use HasFactory, Notifiable;
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
<<<<<<< HEAD
        'role_id',
        'birthdate',
        'phone_num',
        'address'
=======
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
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
<<<<<<< HEAD
    // Define the relationship (User belongs to a Role)
    public
    function role()
    {
        return $this->belongsTo(Role::class);
    }

    // Helper method to check the user's role
    public
    function hasRole($roleName)
    {
        return $this->role->name === $roleName;
    }
=======
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
}
