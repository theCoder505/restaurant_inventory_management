<?php

use App\Models\Admin;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

test('password update requires valid otp', function () {
    $user = Admin::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'otp_code' => '999999',
        ]);

    $response
        ->assertSessionHasErrors('otp_code')
        ->assertRedirect('/settings/password');
});

test('password can be updated with valid otp', function () {
    $user = Admin::factory()->create();

    // Generate valid OTP
    OtpService::generateAndSend($user, 'password_update');
    $cached = Cache::get("admin_otp_{$user->id}_password_update");
    $otp = $cached['otp'];

    $response = $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'otp_code' => $otp,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/password');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = Admin::factory()->create();

    OtpService::generateAndSend($user, 'password_update');
    $cached = Cache::get("admin_otp_{$user->id}_password_update");
    $otp = $cached['otp'];

    $response = $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
            'otp_code' => $otp,
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/settings/password');
});