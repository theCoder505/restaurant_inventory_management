<?php

use App\Http\Controllers\Settings\OtpController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');
    Route::redirect('admin/profile', '/settings/profile');
    Route::redirect('administration-control/profile', '/settings/profile');

    Route::post('settings/otp/send', [OtpController::class, 'send'])->name('settings.otp.send');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/password', [ProfileController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', [ProfileController::class, 'edit'])->name('appearance');
});
