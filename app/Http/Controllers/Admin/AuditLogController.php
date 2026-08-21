<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function exportExcel(Request $request): StreamedResponse
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

        $logs = $query->orderByDesc('created_at')->orderByDesc('id')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Audit Logs');

        // Header
        $sheet->setCellValue('A1', 'SYSTEM AUDIT ACTIVITY LOG');
        $sheet->mergeCells('A1:E1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $filters = [];
        if ($request->filled('start_date')) $filters[] = 'From: ' . $request->start_date;
        if ($request->filled('end_date'))   $filters[] = 'To: ' . $request->end_date;
        if ($request->filled('module'))     $filters[] = 'Module: ' . strtoupper($request->module);
        if ($request->filled('search'))     $filters[] = 'Search: ' . $request->search;
        $sheet->setCellValue('A2', $filters ? implode(' | ', $filters) : 'All Audit Logs');
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A3', 'Exported: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A3:E3');

        // Column headers
        $headers = ['Timestamp', 'Admin User', 'Module', 'Action Executed', 'IP Address'];
        foreach ($headers as $i => $header) {
            $col = chr(65 + $i);
            $sheet->setCellValue($col . '5', $header);
            $sheet->getStyle($col . '5')->getFont()->setBold(true);
        }

        $row = 6;
        foreach ($logs as $log) {
            $sheet->setCellValue('A' . $row, $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue('B' . $row, $log->user_name ?? 'System');
            $sheet->setCellValue('C' . $row, strtoupper($log->module ?? ''));
            $sheet->setCellValue('D' . $row, $log->action ?? '');
            $sheet->setCellValue('E' . $row, $log->ip_address ?? '');
            $row++;
        }

        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'Audit_Logs_' . date('Y-m-d') . '.xlsx';
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        };

        return response()->stream($callback, 200, $headers);
    }
}
