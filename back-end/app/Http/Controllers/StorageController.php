<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{


    public function uploadProfilePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $user = Auth::user();

        // delete old photo
        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $path = $request->file('photo')->store('profile_photos', 'public');

        $user->profile_photo = $path;
        $user->save();

        return response()->json(['message' => 'Photo uploaded successfully.'], 201);
    }

    public function storeDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,png',
            'title' => 'nullable|string|max:255',
            'consultation_id' => 'nullable|exists:consultation,id',
            'patient_id' => 'required|exists:users,id', 
        ]);
    
        $path = $request->file('document')->store('documents', 'public');
    
        Document::create([
            'title' => $request->title,
            'document' => $path,
            'user_id' => $request->patient_id, 
            'consultation_id' => $request->consultation_id,
        ]);
    
        return response()->json(['message' => 'Document uploaded successfully.'], 201);
    }
    public function getDocument($id)
    {
       
    $documents = Document::where('user_id', $id)->get();

    return response()->json($documents);
    }
}
