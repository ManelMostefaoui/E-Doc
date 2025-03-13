<?php

namespace App\Providers;

<<<<<<< HEAD
use Illuminate\Auth\Notifications\ResetPassword;
=======
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
<<<<<<< HEAD
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
=======
        //
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
    }
}
