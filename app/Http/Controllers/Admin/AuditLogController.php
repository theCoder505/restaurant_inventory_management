<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::query();

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('details', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = (int) $request->input('per_page', 20);
        if ($perPage < 5) $perPage = 20;
        if ($perPage > 100) $perPage = 100;

        $logs = $query->orderByDesc('created_at')->orderByDesc('id')->paginate($perPage)->withQueryString();

        $modules = AuditLog::distinct()
            ->whereNotNull('module')
            ->where('module', '!=', '')
            ->pluck('module')
            ->values();

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs,
            'filters' => [
                'module' => $request->input('module', ''),
                'search' => $request->input('search', ''),
                'start_date' => $request->input('start_date', ''),
                'end_date' => $request->input('end_date', ''),
                'per_page' => $perPage,
            ],
            'modules' => $modules,
        ]);
    }
}
