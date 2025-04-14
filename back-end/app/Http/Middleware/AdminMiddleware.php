<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized from middleware'], 403);
        }

        return $next($request);
    }
}
