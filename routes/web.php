<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ExpenseController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PurchaseController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\KotController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Restaurant Landing Page & Recipe Details
Route::get('/', [PublicController::class, 'index'])->name('home');
Route::get('/recipes', [PublicController::class, 'recipes'])->name('recipes.index');
Route::get('/recipi/{menuItem}/{slug?}', [PublicController::class, 'recipeDetail'])->name('recipe.detail');
Route::get('/recipe/{menuItem}/{slug?}', [PublicController::class, 'recipeDetail']);
Route::get('/recipes/{menuItem}/{slug?}', [PublicController::class, 'recipeDetail']);

// Kitchen Display System (KOT) Authentication Routes
Route::get('/kitchen/login', [KotController::class, 'showLogin'])->name('kot.login');
Route::post('/kitchen/login', [KotController::class, 'login'])->name('kot.login.submit');
Route::get('/kot/login', function () {
    return redirect()->route('kot.login');
});

// Kitchen Display System (KOT) Routes - accessible to kitchen manager & admin
Route::middleware(['auth'])->group(function () {
    Route::get('/kitchen', [KotController::class, 'index'])->name('kot.index');
    Route::post('/kitchen/logout', [KotController::class, 'logout'])->name('kot.logout');
    Route::post('/kitchen/profile', [KotController::class, 'updateProfile'])->name('kot.profile.update');
    Route::match(['get', 'post'], '/kitchen/orders', [KotController::class, 'getOrders'])->name('kot.orders');
    Route::post('/kitchen/orders/{order}/status', [KotController::class, 'updateStatus'])->name('kot.update-status');
    Route::post('/kitchen/orders/{order}/item/{item}/status', [KotController::class, 'updateItemStatus'])->name('kot.update-item-status');
    Route::get('/kot', function () {
        return redirect()->route('kot.index');
    });
});

// Authenticated Admin Panel
Route::middleware(['auth'])->prefix('administration-control')->name('admin.')->group(function () {
    // Root Admin redirect
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // KOT Panel shortcut
    Route::get('/kot', [KotController::class, 'index'])->name('kot');

    // Category Management
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Inventory Redirect to Purchases
    Route::get('/inventory', function () {
        return redirect()->route('admin.purchases.index');
    })->name('inventory.index');

    // Purchases & PO Entry
    Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::put('/purchases/{purchase}', [PurchaseController::class, 'update'])->name('purchases.update');
    Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');
    Route::get('/purchases/export-excel', [PurchaseController::class, 'exportExcel'])->name('purchases.export-excel');

    // Used Amount Management
    Route::put('/purchases/items/{item}/used-amount', [PurchaseController::class, 'updateUsedAmount'])->name('purchases.items.update-used-amount');

    // Sales & POS Billing
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::match(['get', 'post'], '/sales/active-orders', [SalesController::class, 'getActiveOrders'])->name('sales.active-orders');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::post('/sales/{order}/complete', [SalesController::class, 'completeOrder'])->name('sales.complete');
    Route::post('/sales/{order}/update-order-status', [SalesController::class, 'updateOrderStatus'])->name('sales.update-status');
    Route::delete('/sales/{order}/cancel', [SalesController::class, 'cancelOrder'])->name('sales.cancel');
    Route::post('/sales/{order}/add-items', [SalesController::class, 'addItems'])->name('sales.add-items');
    Route::get('/sales/log', [SalesController::class, 'ordersLog'])->name('sales.log');
    Route::get('/sales/export-excel', [SalesController::class, 'exportExcel'])->name('sales.export-excel');

    // Expense Tracking
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    Route::get('/expenses/export-excel', [ExpenseController::class, 'exportExcel'])->name('expenses.export-excel');

    // Financial Reports & P&L
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/send-daily-summary', [ReportController::class, 'triggerDailyEmail'])->name('reports.send-daily-summary');
    Route::post('/reports/trigger-daily-email', [ReportController::class, 'triggerDailyEmail'])->name('reports.trigger-daily-email');
    Route::get('/reports/export-csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');
    Route::get('/reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');

    // Menu & Dish Management
    Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/menu', [MenuController::class, 'store'])->name('menu.store');
    Route::put('/menu/{menuItem}', [MenuController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{menuItem}', [MenuController::class, 'destroy'])->name('menu.destroy');
    Route::post('/menu/{menuItem}/toggle-availability', [MenuController::class, 'toggleAvailability'])->name('menu.toggle-availability');

    // Suppliers / Vendors
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::get('/suppliers/export-excel', [SupplierController::class, 'exportExcel'])->name('suppliers.export-excel');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    // HR & Employees
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'storeEmployee'])->name('employees.store');
    Route::post('/employees/salary', [EmployeeController::class, 'generateSalary'])->name('employees.salary');
    Route::post('/employees/generate-salary', [EmployeeController::class, 'generateSalary'])->name('employees.generate-salary');
    Route::put('/employees/salary/{salary}', [EmployeeController::class, 'updateSalary'])->name('employees.salary.update');
    Route::delete('/employees/salary/{salary}', [EmployeeController::class, 'destroySalary'])->name('employees.salary.destroy');
    Route::post('/employees/attendance', [EmployeeController::class, 'logAttendance'])->name('employees.attendance');
    Route::put('/employees/{employee}', [EmployeeController::class, 'updateEmployee'])->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroyEmployee'])->name('employees.destroy');
    Route::get('/employees/export-excel', [EmployeeController::class, 'exportExcel'])->name('employees.export-excel');

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/export-excel', [AuditLogController::class, 'exportExcel'])->name('audit-logs.export-excel');

    // Customer Reviews Management
    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::post('/reviews/{review}/toggle-active', [ReviewController::class, 'toggleActive'])->name('reviews.toggle-active');

    // App Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('/settings/backup', [SettingController::class, 'backupDatabase'])->name('settings.backup');
    Route::get('/settings/backup-db', [SettingController::class, 'backupDatabase'])->name('settings.backup-db');
});

// Legacy redirects from /admin to /administration-control
Route::get('/admin', function () {
    return redirect('/administration-control/dashboard');
});
Route::get('/admin/{any}', function ($any) {
    return redirect('/administration-control/' . $any);
})->where('any', '.*');

// Also alias /dashboard to /administration-control/dashboard for Inertia auth redirect fallback
Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth'])->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Fallback route for invalid URLs
Route::fallback(function () {
    return Inertia::render('error', ['status' => 404]);
});
