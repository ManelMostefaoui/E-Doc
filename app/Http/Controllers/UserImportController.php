<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\UsersImport;
use Illuminate\Support\Facades\Auth;

class UserImportController extends Controller
{
    public function import(Request $request)
    {
        // Vérifier si l'utilisateur est authentifié et est un admin
        if (!Auth::check() || Auth::user()->role->name !== 'admin') {
            return response()->json(['error' => 'Accès refusé. Seul un administrateur peut importer des utilisateurs.'], 403);
        }

        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new UsersImport, $request->file('file'));

        return response()->json(['message' => 'Users imported successfully'], 200);
    }
}
