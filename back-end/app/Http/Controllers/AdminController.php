<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Auth;



class AdminController extends Controller
{

    public function getUserCounts(Request $request)
    {

        $user = $request->user(); // Get authenticated user


        if (!$user) {
            return response()->json(['message' => 'Unauthorized: No user found'], 401);
        }

        if (!$user->role || $user->role->name !== 'admin') {
            return response()->json(['message' => 'Unauthorized: You are not admin'], 403);
        }

        return response()->json([
            'students' => User::where('role_id', 1)->count(),
            'teachers' => User::where('role_id', 2)->count(),
            'employer' => User::where('role_id', 3)->count(),
        ]);
    }


    public function listUsers()
    {
        return response()->json(
            User::with('role')->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->name ?? null, // Assuming role has a 'name' field
                ];
            })
        );
    }


    public function listUsersByRole($role)
    {
        $users = User::whereHas('role', function ($query) use ($role) {
            $query->where('name', $role);
        })->get();

        return response()->json($users->map(function ($user) {
            return [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : null,
            ];
        }));
    }
    public function getUserById($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([

            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->name,
            'gender' => $user->gender,
            'birthdate' => $user->birthdate,
            'phone_num' => $user->phone_num,
            'address' => $user->address,

        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update($request->all());

        return response()->json(['message' => 'User updated successfully']);
    }
}
