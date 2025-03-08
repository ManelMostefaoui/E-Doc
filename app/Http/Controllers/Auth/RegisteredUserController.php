<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:' . User::class,
                function ($attribute, $value, $fail) {
                    if (!str_ends_with($value, '@esi-sba.dz')) {
                        $fail("The email must be an @esi-sba.dz email.");
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'birthdate' => ['nullable', 'date'],
            'phone_num' => ['nullable', 'string', 'max:10'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->string('password')),
            'birthdate' => $request->birthdate,
            'phone_num' => $request->phone_num,
            'address' => $request->address,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
