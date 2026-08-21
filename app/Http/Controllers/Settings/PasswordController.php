<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\AuditLogService;
use App\Services\OtpService;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/password', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
            'otp_code' => ['required', 'string', 'digits:6'],
        ], [
            'otp_code.required' => 'The 6-digit OTP verification code is required.',
            'otp_code.digits' => 'The verification code must be exactly 6 digits.',
        ]);

        if (!OtpService::verify($request->user(), 'password_update', $validated['otp_code'] ?? null)) {
            throw ValidationException::withMessages([
                'otp_code' => 'The verification code provided is invalid or has expired. Please request a new code.',
            ]);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditLogService::log("Updated admin password credentials", 'security');

        return back()->with('success', 'Admin password updated successfully.');
    }
}
