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

        $employees = $query->orderBy('name')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');
        $allSalaries = Salary::with('employee')->orderByDesc('month_year')->orderByDesc('id')->get();

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
            'payment_status' => 'required|in:paid,unpaid',
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
                'payment_status' => $validated['payment_status'],
                'payment_date' => $validated['payment_date'] ?? now()->format('Y-m-d'),
                'notes' => $validated['notes'] ?? null,
            ]
        );

        $emp = Employee::find($validated['employee_id']);
        AuditLogService::log("Generated salary for {$emp?->name} ({$validated['month_year']}) net pay: {$netPay}", "employees");

        return redirect()->back()->with('success', 'Salary record generated.');
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
}
