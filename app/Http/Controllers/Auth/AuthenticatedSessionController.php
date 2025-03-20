<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;

use Illuminate\Auth\Access\Response as AccessResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;



class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */

    public function store(Request $request): JsonResponse
    {
        // Validate input
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Check email
        $user = User::where('email', $fields['email'])->first();

        // Check password
        if (!$user) {
            return response()->json([
                'message' => 'Email not found'
            ], 401);
        }

        // Check if the password is correct
        if (!Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'Incorrect password'
            ], 401);
        }


        $user->tokens()->delete(); // Delete old tokens
        $token = $user->createToken('api-token'); // Generate new token

        // Return response
        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token->plainTextToken,
        ], 200);
    }
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Supprime uniquement le token actuel de l'utilisateur
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "status" => true,
            "message" => "Log out succ"
        ], 200);
    }

    public function showProfile(): JsonResponse
    {
        $user = Auth::user();  // Récupérer l'utilisateur authentifié


        return response()->json([
            'status' => true,
            'message' => 'Détails du profil',
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : null, // Vérifie si le rôle existe
                'gender' => $user->gender,
                'birthdate' => $user->birthdate,
                'phone_num' => $user->phone_num,
                'address' => $user->address,
            ],
        ]);
    }
    /**
     * update profil .
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::user(); // Récupérer l'utilisateur authentifié

        // dd($user instanceof \App\Models\User);


        // Validation des données entrantes
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
                function ($attribute, $value, $fail) {
                    if (!str_ends_with($value, '@esi-sba.dz')) {
                        $fail("The email must be an @esi-sba.dz email.");
                    }
                }
            ],
            'gender' => 'sometimes|in:male,female',

            'phone_num' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:500',
            'birthdate' => 'nullable|date',
        ]);

        // Mettre à jour uniquement les champs envoyés
        $user->update($request->only(['name', 'email', 'gender', 'phone_num', 'address', 'birthdate']));
        return response()->json([
            'status' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => $user
        ]);
    }
}
