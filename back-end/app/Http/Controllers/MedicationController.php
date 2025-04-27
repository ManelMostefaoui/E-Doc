<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Imports\MedicationsImport;
use Maatwebsite\Excel\Facades\Excel;

class MedicationController extends Controller
{
    //Import medicament
    public function import(Request $request)
    {
        if (Auth::user()->role_id !== 5) {
            return response()->json(['error' => 'Accès non autorisé.'], 403); // Renvoyer une erreur 403 si l'utilisateur n'est pas un doctor
        }
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv', // Accepter les fichiers Excel ou CSV
        ]);

        Excel::import(new MedicationsImport, $request->file('file'));
        return response()->json(['message' => 'Médicaments importés avec succès !']);
    }
    // Liste des medicament
    public function index()
    {        $medications = Medication::all();
        return response()->json($medications);
    }

    // Vérification du rôle dans la méthode store
    public function store(Request $request)
    {
        // Vérifiez que l'utilisateur a le rôle 'doctor' (role_id = 5)
        if (Auth::user()->role_id !== 5) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        // Valider les données
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'dosage' => 'required|string',
        ]);

        // Créer le médicament
        Medication::create($validated);

        return response()->json(['message' => 'Médicament ajouté avec succès.']);
    }

    // Vérification du rôle dans la méthode update
    public function update(Request $request, $id)
    {
        // Vérifiez que l'utilisateur a le rôle 'doctor' (role_id = 5)
        if (Auth::user()->role_id !== 5) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        // Valider les données
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'dosage' => 'required|string',
        ]);

        // Trouver le médicament
        $medication = Medication::findOrFail($id);
        $medication->update($validated);

        return response()->json(['message' => 'Médicament mis à jour avec succès.']);
    }

    // Vérification du rôle dans la méthode destroy
    public function destroy($id)
    {
        // Vérifiez que l'utilisateur a le rôle 'doctor' (role_id = 5)
        if (Auth::user()->role_id !== 5) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        // Trouver et supprimer le médicament
        $medication = Medication::findOrFail($id);
        $medication->delete();

        return response()->json(['message' => 'Médicament supprimé avec succès.']);
    }
}
