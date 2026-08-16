<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    public static function log(string $action, string $module, ?string $details = null): void
    {
        try {
            $user = Auth::user();
            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'System',
                'action' => $action,
                'module' => $module,
                'ip_address' => Request::ip(),
                'details' => $details,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Ignore audit log failure to not disrupt main request
        }
    }
}
