<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
<<<<<<< HEAD
    return ['Laravel' => app()->version()];
});

// require __DIR__.'/auth.php';
=======
    return view('welcome');
});
>>>>>>> 4a915970c176a70a4c1e6235e33c4a8ca175d2d0
