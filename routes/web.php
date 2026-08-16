<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ExpenseController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PurchaseController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

// Public Restaurant Landing Page
Route::get('/', [PublicController::class, 'index'])->name('home');

// Authenticated Admin Panel
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Inventory & Purchase Management
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::put('/inventory/{item}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{item}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventory/{item}/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust');
    Route::get('/inventory/export-csv', [InventoryController::class, 'exportCsv'])->name('inventory.export-csv');

    // Purchases
    Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::put('/purchases/{purchase}/status', [PurchaseController::class, 'updateStatus'])->name('purchases.update-status');
    Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');

    // Sales & POS Billing
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::get('/sales/log', [SalesController::class, 'ordersLog'])->name('sales.log');

    // Expense Tracking
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');

    // Financial Reports & P&L
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/trigger-daily-email', [ReportController::class, 'triggerDailyEmail'])->name('reports.trigger-daily-email');
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');

    // Menu & Recipe Builder
    Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/menu', [MenuController::class, 'store'])->name('menu.store');
    Route::put('/menu/{menuItem}', [MenuController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{menuItem}', [MenuController::class, 'destroy'])->name('menu.destroy');
    Route::post('/menu/{menuItem}/toggle-availability', [MenuController::class, 'toggleAvailability'])->name('menu.toggle-availability');
    Route::post('/menu/{menuItem}/recipe', [MenuController::class, 'saveRecipe'])->name('menu.save-recipe');

    // Suppliers / Vendors
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // HR & Employees
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'storeEmployee'])->name('employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'updateEmployee'])->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroyEmployee'])->name('employees.destroy');
    Route::post('/employees/salary', [EmployeeController::class, 'generateSalary'])->name('employees.salary');
    Route::post('/employees/attendance', [EmployeeController::class, 'logAttendance'])->name('employees.attendance');

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // App Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('/settings/backup', [SettingController::class, 'backupDatabase'])->name('settings.backup');
    Route::get('/settings/backup-db', [SettingController::class, 'backupDatabase'])->name('settings.backup-db');
});

// Also alias /dashboard to /admin/dashboard for Inertia auth redirect fallback
Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Fallback route for invalid URLs
Route::fallback(function () {
    return Inertia::render('error', ['status' => 404]);
});
