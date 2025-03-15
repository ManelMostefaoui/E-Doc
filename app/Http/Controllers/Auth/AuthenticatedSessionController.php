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
}
