<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    /**
     * Send OTP to the current authenticated user's email.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:profile_update,password_update'],
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $result = OtpService::generateAndSend($user, $validated['action']);

        return response()->json($result, $result['success'] ? 200 : 429);
    }
}
