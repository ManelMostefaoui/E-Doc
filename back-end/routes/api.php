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
use App\Http\Controllers\BiometricDataController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\PatientController;
use App\Models\PersonalHistory;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\PersonalHistoryController;
use App\Http\Controllers\ScreeningController;
use App\Http\Controllers\UserImportController;
use App\Http\Middleware\AdminMiddleware;
use App\Models\PersonalHistory;
use App\Models\Screening;
use App\Http\Controllers\MedicationController;


Route::middleware(['auth:sanctum'])->get('/user/{id}', function (Request $request) {
    return $request->user();
});


Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth', 'throttle:6,1'])
    ->name('verification.send');

//logout
Route::middleware('auth:sanctum')->post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');



// Group all routes under both 'auth:sanctum' and 'admin' middleware
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Admin-specific routes
    Route::get('/admin/user-counts', [AdminController::class, 'getUserCounts']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::get('/admin/users/{role}', [AdminController::class, 'listUsersByRole']);

    // Profile routes (admin-only)
    Route::get('profile', [AuthenticatedSessionController::class, 'showProfile']);
    Route::put('profile/update', [AuthenticatedSessionController::class, 'updateProfile']);
    Route::put('profile/update-password', [AuthenticatedSessionController::class, 'updatePassword']);

    // Import users (admin-only)
    Route::post('/import-users', [UserImportController::class, 'import']);
    Route::middleware(['auth:sanctum'])->get('/user/{id}', [AdminController::class, 'getUserById']);
});





Route::middleware(['auth:sanctum'])->group(function () {
    Route::put('/patients/{patient}/biometric-data', [BiometricDataController::class, 'update']);
});

Route::put('/patients/{patient}', [PatientController::class, 'update']);
Route::get('/patients/{id}', [PatientController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/users/{id}', [AuthenticatedSessionController::class, 'deleteuUser']);
});

Route::middleware(['auth:sanctum', 'doctor'])->group(function () {

    //medical history
    Route::get('/patients/{id}/medical-history', [MedicalHistoryController::class, 'showPatientHistory']);
    Route::post('/patients/{patient}/medical-history', [MedicalHistoryController::class, 'store']);
    Route::put('/medical-history/{id}', [MedicalHistoryController::class, 'update']);

    //personal history
    Route::post('/personal-history/store', [PersonalHistoryController::class, 'store']);
    Route::put('/Personal-history/update/{id}', [PersonalHistoryController::class, 'update']);
    Route::post('/Screening/store', [ScreeningController::class, 'store']);       // Create new screening
    Route::put('/Screening/update/{id}', [ScreeningController::class, 'update']);   // Update existing screening

    //medication lists
    Route::get('/medications', [MedicationController::class, 'index']);
    Route::post('/medications-add', [MedicationController::class, 'store']);
    Route::put('/medications/{id}', [MedicationController::class, 'update']);
    Route::delete('/medications/{id}', [MedicationController::class, 'destroy']);
    Route::post('/medications/import', [MedicationController::class, 'import'])->name('medications.import');

    //get patient list
    Route::get('/patients', [PatientController::class, 'index']);
    Route::get('/patients-archived', [PatientController::class, 'showArchivedPatients']);

    //archived and unarchived medical record of patient
    Route::patch('/patients/{id}/archive', [PatientController::class, 'archive']);
    Route::patch('/patients/{id}/restore', [PatientController::class, 'restore']);
});

Route::middleware('auth:sanctum')->post('/change-password', [AuthenticatedSessionController::class, 'changePassword']);

Route::middleware(['auth:sanctum'])->get('/user/{id}', [AdminController::class, 'getUserById']);
