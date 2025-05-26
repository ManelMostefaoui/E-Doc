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

        return back()->with('success', 'Profile photo updated!');
    }

    public function storeDocument(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx,jpg,png', // adjust types as needed
            'title' => 'nullable|string|max:255',
            'consultation_id' => 'nullable|exists:consultation,id',
        ]);

        // Store file
        $path = $request->file('document')->store('documents', 'public');

        // Create document record
        Document::create([
            'title' => $request->title,
            'document' => $path,
            'user_id' => Auth::id(), // assuming user is logged in
            'consultation_id' => $request->consultation_id,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }
}
