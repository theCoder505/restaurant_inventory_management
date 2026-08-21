<?php

use App\Models\Admin;
use App\Services\OtpService;
use Illuminate\Support\Facades\Cache;

test('profile page is displayed', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->get('/settings/profile');

    $response->assertOk();
});

test('otp can be sent to admin current email', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->postJson('/settings/otp/send', [
            'action' => 'profile_update',
        ]);

    $response
        ->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    expect(Cache::has("admin_otp_{$admin->id}_profile_update"))->toBeTrue();
});

test('profile update requires valid otp', function () {
    $admin = Admin::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => 'Updated Admin',
            'email' => 'updated@example.com',
            'otp_code' => '000000',
        ]);

    $response
        ->assertSessionHasErrors('otp_code')
        ->assertRedirect('/settings/profile');
});

test('profile information can be updated with valid otp', function () {
    $admin = Admin::factory()->create();

    OtpService::generateAndSend($admin, 'profile_update');
    $cached = Cache::get("admin_otp_{$admin->id}_profile_update");
    $otp = $cached['otp'];

    $response = $this
        ->actingAs($admin)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => 'Updated Admin',
            'email' => 'updated@example.com',
            'otp_code' => $otp,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $admin->refresh();

    expect($admin->name)->toBe('Updated Admin');
    expect($admin->email)->toBe('updated@example.com');
    expect($admin->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $admin = Admin::factory()->create();

    OtpService::generateAndSend($admin, 'profile_update');
    $cached = Cache::get("admin_otp_{$admin->id}_profile_update");
    $otp = $cached['otp'];

    $response = $this
        ->actingAs($admin)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => 'Updated Name Only',
            'email' => $admin->email,
            'otp_code' => $otp,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    expect($admin->refresh()->email_verified_at)->not->toBeNull();
});