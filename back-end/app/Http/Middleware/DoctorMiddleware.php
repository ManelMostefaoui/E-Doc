<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DoctorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Vérifier si l'utilisateur a le rôle 'doctor'
        if (auth()->user()->role->name !== 'doctor') {
            return response()->json(['error' => 'Unauthorized Role'], 403);
        }

        return $next($request); // Continuer si l'utilisateur a le rôle 'doctor'
    }
}
