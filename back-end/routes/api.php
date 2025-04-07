<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserImportController;
use Illuminate\Http\JsonResponse;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

Route::middleware('auth:sanctum')->post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');


Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/user-counts', [AdminController::class, 'getUserCounts']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::get('/admin/users/{role}', [AdminController::class, 'listUsersByRole']);
});

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

Route::middleware('auth:sanctum')->post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');



Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/user-counts', [AdminController::class, 'getUserCounts']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::get('/admin/users/{role}', [AdminController::class, 'listUsersByRole']);
});

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('profile', [AuthenticatedSessionController::class, 'showProfile']);

Route::middleware('auth:sanctum')->put('profile/update', [AuthenticatedSessionController::class, 'updateProfile']);

Route::middleware('auth:sanctum')->put('profile/update-password', [AuthenticatedSessionController::class, 'updatePassword']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/import-users', [UserImportController::class, 'import']);
});

// Route::middleware(['auth:sanctum'])->group(function () {
//     Route::put('/patients/{patient}/biometric-data', [BiometricDataController::class, 'update']);
// });

// Route::put('/patients/{patient}', [PatientController::class, 'update']);
// Route::get('/patients/{id}', [PatientController::class, 'show']);

// Route::post('/patients/{patient}/medical-history', [MedicalHistoryController::class, 'store']);
// Route::put('/medical-history/{id}', [MedicalHistoryController::class, 'update']);

// Route::get('/patients/{id}/medical-history', [MedicalHistoryController::class, 'showPatientHistory']);
