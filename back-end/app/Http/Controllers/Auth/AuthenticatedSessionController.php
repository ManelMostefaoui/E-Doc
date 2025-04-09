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
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;



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

        $user = Auth::user(); // Récupérer l'utilisateur authentifié

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
            'gender' => ['required', 'in:male,female'],
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



    public function deleteuUser($id)
    {
        $admin = Auth::user();

        // Vérifier que l'utilisateur connecté est un admin (role_id = 4)
        if ($admin->role_id !== 4) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Supprimer l'utilisateur (et ses relations si besoin)
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }


    /**
     * Méthode pour changer le mot de passe de l'utilisateur.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        // Validation des champs de la requête
        $request->validate([
            'current_password' => 'required', // L'ancien mot de passe est obligatoire
            'new_password' => 'required|min:8|confirmed', // Le nouveau mot de passe doit être confirmé
        ]);

        // Récupérer l'utilisateur authentifié
        $user = Auth::user(); // L'utilisateur authentifié via Sanctum

        // Vérifier si l'utilisateur est bien authentifié
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        // Vérification de l'ancien mot de passe
        if (!Hash::check($request->current_password, $user->password)) {
            // Retourner un message d'erreur détaillé lorsque l'ancien mot de passe est incorrect
            return response()->json(['error' => 'L\'ancien mot de passe est incorrect.'], 400);
        }

        // Mise à jour du mot de passe
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Retourner une réponse de succès
        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

}
