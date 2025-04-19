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
use App\Models\Screening;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\ConsultationRequestController;
use App\Http\Controllers\NotificationController;


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user()->load('role');

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role->name, // ICI ça récupère le nom depuis la table roles
    ]);
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


// -----------------------------------------------------------------------------------------------------------
// Group all routes under both 'auth:sanctum' and 'admin' middleware
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Admin-specific routes
    Route::get('/admin/user-counts', [AdminController::class, 'getUserCounts']);
    Route::get('/admin/users', [AdminController::class, 'listUsers']);
    Route::get('/admin/users/{role}', [AdminController::class, 'listUsersByRole']);

    // Profile routes (admin-only)
    Route::get('/user/{id}', [AdminController::class, 'getUserById']);

    // Import users (admin-only)
    Route::post('/import-users', [UserImportController::class, 'import']);

    //delete user
    Route::delete('/users/{id}', [AuthenticatedSessionController::class, 'deleteuUser']);
});

// -----------------------------------------------------------------------------------------------------------
// Group all routes under both 'auth:sanctum' and 'doctor' middleware
Route::middleware(['auth:sanctum', 'doctor'])->group(function () {

    //patient info edit
    Route::put('/patients/{patient}/biometric-data', [BiometricDataController::class, 'update']);
    Route::put('/patients/{patient}', [PatientController::class, 'update']); //blood-ssn-family status
    Route::get('/patients/{id}', [PatientController::class, 'show']);

    //medical history
    Route::get('/patients/{id}/medical-history', [MedicalHistoryController::class, 'showPatientHistory']);
    Route::post('/patients/{patient}/medical-history', [MedicalHistoryController::class, 'store']);
    Route::put('/medical-history/{id}', [MedicalHistoryController::class, 'update']);

    //personal history
    Route::post('/personal-history/store', [PersonalHistoryController::class, 'store']);
    Route::put('/Personal-history/update/{id}', [PersonalHistoryController::class, 'update']);

    //screening
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

    //programmer une consulation
    Route::post('/consultation-request/{id}/schedule', [ConsultationRequestController::class, 'scheduleAppointment']);
    Route::put('/consultation-request/{id}/update-appointment', [ConsultationRequestController::class, 'updateAppointmentDate']);
    Route::get('/received-requests', [ConsultationRequestController::class, 'getReceivedRequests']);
});

// -----------------------------------------------------------------------------------------------------------
//Group all routes under 'auth:sanctum' and personal info
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('profile', [AuthenticatedSessionController::class, 'showProfile']);
    Route::put('profile/update', [AuthenticatedSessionController::class, 'updateProfile']);
    Route::post('/change-password', [AuthenticatedSessionController::class, 'changePassword']);

    //demande consultation , confirmer ou annuler
    Route::post('/consultation-request', [ConsultationRequestController::class, 'submitRequest']);
    Route::post('/consultation-request/{id}/confirm', [ConsultationRequestController::class, 'confirmRequest']);
    Route::post('/consultation-request/{id}/cancel', [ConsultationRequestController::class, 'cancelRequest']);

    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::get('/sent-requests', [ConsultationRequestController::class, 'getSentRequests']);

});
