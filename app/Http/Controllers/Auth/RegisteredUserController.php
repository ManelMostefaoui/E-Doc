<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Http\JsonResponse;


class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string',  'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_name' => ['required', 'exists:roles,name'],
            'birthdate' => ['nullable', 'date'],
            'phone_num' => ['nullable', 'string', 'max:15'],
            'address' => ['nullable', 'string', 'max:500'],

        ]);

        $role = Role::where('name', $request->role_name)->first();

        if (!$role) {
            return response()->json(['error' => 'Invalid role name'], 400);
        }


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'birthdate' => $request->birthdate,
            'phone_num' => $request->phone_num,
            'address' => $request->address,

        ]);

        event(new Registered($user));

        Auth::login($user);
        $token = $user->createToken('api_token');



        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken,
        ]);
    }
}
