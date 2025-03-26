<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{

    public function handle(Request $request, Closure $next)
    {
        dd(Auth::user()); // 🔍 Voir l'utilisateur authentifié

        if (Auth::check() && Auth::user()->role_id === 4) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès refusé. Admin requis.'], 403);
    }
}
