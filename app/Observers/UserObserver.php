<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Patient;

class UserObserver
{
    public function created(User $user)
    {
        // Vérifier si le rôle de l'utilisateur est "student", "teacher" ou "employer"
        if (in_array($user->role_id, [1, 2, 3])) {
            Patient::create([
                'user_id' => $user->id,
                'groupe_sanguin' => null, // Peut être null
                'num_securite_sociale' => null, // Peut être null
                'situation_familiale' => null, // Peut être null
                'taille' => null, // Peut être null
                'poids' => null, // Peut être null
            ]);
        }
    }
}
