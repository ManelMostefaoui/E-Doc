<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
<<<<<<< HEAD
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\AdminController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');



Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/user-counts', [AdminController::class, 'getUserCounts']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::get('/admin/users/{role}', [AdminController::class, 'listUsersByRole']);
});
=======

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
