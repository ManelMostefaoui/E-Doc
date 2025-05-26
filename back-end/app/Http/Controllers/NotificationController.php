<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupérer toutes les notifications de l'utilisateur authentifié.
     *
     * @return \Illuminate\Http\Response
     */
    public function getNotifications()
    {
        // Récupérer l'utilisateur authentifié
        $user = auth()->user();

        // Vérifier si l'utilisateur a des notifications
        $notifications = $user->notifications;  // Utilisation de la relation 'notifications'

        // Si l'utilisateur est un médecin, afficher les notifications
        if ($user->role->role === 'doctor') {
            // Filtrer les notifications pour s'assurer qu'elles concernent des demandes de consultation
            $notifications = $user->notifications()->where('data->message', 'like', '%demande de consultation%')->get();
        }

        // Ajouter un log pour vérifier les notifications récupérées
        \Log::info('Notifications récupérées :', $notifications->toArray());

        // Retourner les notifications sous forme de réponse JSON
        return response()->json([
            'notifications' => $notifications
        ]);
    }
}
