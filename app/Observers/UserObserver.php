<?php
namespace App\Observers;

use App\Models\User;
use App\Models\Patient;
use App\Models\MedicalHistory; // 🔥 Ajoute cette ligne

class UserObserver
{
    public function created(User $user)
    {
        // Vérifier si l'utilisateur a un rôle de patient
        if (in_array($user->role_id, [1, 2, 3])) {
            $patient = Patient::create([
                'user_id' => $user->id,
                'blood_group' => null,
                'social_security_no' => null,
                'family_status' => null,
            ]);

            // 🔥 Ajouter automatiquement une ligne dans medical_histories
            MedicalHistory::create([
                'patient_id' => $patient->id,
                'congenital_disease' => null,
                'general_disease' => null,
                'surgery' => null,
                'allergy' => null,
                'description' => null,
                'date' => null,
            ]);
        }
    }
}
