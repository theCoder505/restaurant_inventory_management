<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\Salary;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Employee::with(['salaries' => function ($q) {
            $q->orderByDesc('month_year');
        }, 'attendanceLogs' => function ($q) {
            $q->whereDate('date', '>=', now()->subDays(30))->orderByDesc('date');
        }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('role_title', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderByDesc('id')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');
        $allSalaries = Salary::with('employee')->orderByDesc('updated_at')->orderByDesc('id')->get();

        return Inertia::render('admin/employees/index', [
            'employees' => $employees,
            'allSalaries' => $allSalaries,
            'currency' => $currency,
            'filters' => $request->only(['search']),
        ]);
    }

    public function storeEmployee(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role_title' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'joining_date' => 'nullable|date',
            'base_salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $employee = Employee::create($validated);

        AuditLogService::log("Added employee: {$employee->name} ({$employee->role_title})", "employees");

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    public function updateEmployee(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role_title' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'joining_date' => 'nullable|date',
            'base_salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $employee->update($validated);

        AuditLogService::log("Updated employee profile: {$employee->name}", "employees");

        return redirect()->back()->with('success', 'Employee profile updated.');
    }

    public function destroyEmployee(Employee $employee)
    {
        $name = $employee->name;
        $employee->delete();

        AuditLogService::log("Deleted employee: {$name}", "employees");

        return redirect()->back()->with('success', 'Employee record deleted.');
    }

    public function generateSalary(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month_year' => 'required|string|regex:/^\d{4}-\d{2}$/', // e.g. "2026-08"
            'base_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|in:paid,unpaid',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $bonus = (float)($validated['bonus'] ?? 0);
        $deduction = (float)($validated['deduction'] ?? 0);
        $netPay = max(0, $validated['base_salary'] + $bonus - $deduction);

        $salary = Salary::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'month_year' => $validated['month_year'],
            ],
            [
                'base_salary' => $validated['base_salary'],
                'bonus' => $bonus,
                'deduction' => $deduction,
                'net_pay' => $netPay,
                'payment_status' => $validated['payment_status'] ?? 'paid',
                'payment_date' => $validated['payment_date'] ?? now()->format('Y-m-d'),
                'notes' => $validated['notes'] ?? null,
            ]
        );

        $emp = Employee::find($validated['employee_id']);
        AuditLogService::log("Generated salary for {$emp?->name} ({$validated['month_year']}) net pay: {$netPay}", "employees");

        return redirect()->back()->with('success', 'Salary record generated.');
    }

    public function updateSalary(Request $request, Salary $salary)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month_year' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'base_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|in:paid,unpaid',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $bonus = (float)($validated['bonus'] ?? 0);
        $deduction = (float)($validated['deduction'] ?? 0);
        $netPay = max(0, $validated['base_salary'] + $bonus - $deduction);

        $salary->update([
            'employee_id' => $validated['employee_id'],
            'month_year' => $validated['month_year'],
            'base_salary' => $validated['base_salary'],
            'bonus' => $bonus,
            'deduction' => $deduction,
            'net_pay' => $netPay,
            'payment_status' => $validated['payment_status'] ?? 'paid',
            'payment_date' => $validated['payment_date'] ?? now()->format('Y-m-d'),
            'notes' => $validated['notes'] ?? null,
        ]);

        $emp = Employee::find($validated['employee_id']);
        AuditLogService::log("Updated salary voucher for {$emp?->name} ({$validated['month_year']}) net pay: {$netPay}", "employees");

        return redirect()->back()->with('success', 'Salary voucher updated successfully.');
    }

    public function destroySalary(Salary $salary)
    {
        $empName = $salary->employee?->name ?? 'Staff';
        $month = $salary->month_year;
        $salary->delete();

        AuditLogService::log("Deleted salary voucher for {$empName} ({$month})", "employees");

        return redirect()->back()->with('success', 'Salary voucher deleted successfully.');
    }

    public function logAttendance(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,leave,half_day',
            'notes' => 'nullable|string',
        ]);

        AttendanceLog::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'date' => $validated['date'],
            ],
            [
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return redirect()->back()->with('success', 'Attendance log updated.');
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $currency = AppSetting::getByKey('default_currency', '৳');

        $spreadsheet = new Spreadsheet();

        // ── Sheet 1: Employees ──────────────────────────────────────────────
        $empSheet = $spreadsheet->getActiveSheet();
        $empSheet->setTitle('Employees');

        $empSheet->setCellValue('A1', 'EMPLOYEES & STAFF ROSTER');
        $empSheet->mergeCells('A1:G1');
        $empSheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $empSheet->setCellValue('A2', 'Exported: ' . now()->format('Y-m-d H:i'));
        $empSheet->mergeCells('A2:G2');

        $empCols = ['Name', 'Role / Title', 'Phone', 'Email', 'Status', 'Joining Date', 'Base Salary'];
        foreach ($empCols as $i => $col) {
            $letter = chr(65 + $i);
            $empSheet->setCellValue($letter . '4', $col);
            $empSheet->getStyle($letter . '4')->getFont()->setBold(true);
        }

        $employees = Employee::orderBy('name')->get();
        $row = 5;
        foreach ($employees as $emp) {
            $empSheet->setCellValue('A' . $row, $emp->name);
            $empSheet->setCellValue('B' . $row, $emp->role_title);
            $empSheet->setCellValue('C' . $row, $emp->phone ?? '-');
            $empSheet->setCellValue('D' . $row, $emp->email ?? '-');
            $empSheet->setCellValue('E' . $row, strtoupper($emp->status));
            $empSheet->setCellValue('F' . $row, $emp->joining_date ?? '-');
            $empSheet->setCellValue('G' . $row, (float)$emp->base_salary);
            $empSheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $row++;
        }
        foreach (range('A', 'G') as $col) {
            $empSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // ── Sheet 2: Salary Records ─────────────────────────────────────────
        $salarySheet = $spreadsheet->createSheet();
        $salarySheet->setTitle('Salary Records');

        $salarySheet->setCellValue('A1', 'STAFF SALARY DISBURSEMENT RECORDS');
        $salarySheet->mergeCells('A1:H1');
        $salarySheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $salarySheet->setCellValue('A2', 'Exported: ' . now()->format('Y-m-d H:i'));
        $salarySheet->mergeCells('A2:H2');

        $salCols = ['Employee', 'Role', 'Month / Year', 'Base Salary', 'Bonus', 'Deduction', 'Net Pay', 'Status'];
        foreach ($salCols as $i => $col) {
            $letter = chr(65 + $i);
            $salarySheet->setCellValue($letter . '4', $col);
            $salarySheet->getStyle($letter . '4')->getFont()->setBold(true);
        }

        $salaries = Salary::with('employee')->orderByDesc('month_year')->orderByDesc('id')->get();
        $row = 5;
        $totalNet = 0;
        foreach ($salaries as $salary) {
            $salarySheet->setCellValue('A' . $row, $salary->employee->name ?? 'Unknown');
            $salarySheet->setCellValue('B' . $row, $salary->employee->role_title ?? '-');
            $salarySheet->setCellValue('C' . $row, $salary->month_year);
            $salarySheet->setCellValue('D' . $row, (float)$salary->base_salary);
            $salarySheet->setCellValue('E' . $row, (float)$salary->bonus);
            $salarySheet->setCellValue('F' . $row, (float)$salary->deduction);
            $salarySheet->setCellValue('G' . $row, (float)$salary->net_pay);
            $salarySheet->setCellValue('H' . $row, strtoupper($salary->payment_status));
            foreach (['D', 'E', 'F', 'G'] as $numCol) {
                $salarySheet->getStyle($numCol . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            }
            $totalNet += (float)$salary->net_pay;
            $row++;
        }

        $row++;
        $salarySheet->setCellValue('F' . $row, 'TOTAL NET PAY:');
        $salarySheet->getStyle('F' . $row)->getFont()->setBold(true);
        $salarySheet->setCellValue('G' . $row, $totalNet);
        $salarySheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('#,##0.00');
        $salarySheet->getStyle('G' . $row)->getFont()->setBold(true);

        foreach (range('A', 'H') as $col) {
            $salarySheet->getColumnDimension($col)->setAutoSize(true);
        }

        $spreadsheet->setActiveSheetIndex(0);

        $filename = 'Employees_Salaries_' . date('Y-m-d') . '.xlsx';
        $httpHeaders = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        };

        return response()->stream($callback, 200, $httpHeaders);
    }
}
