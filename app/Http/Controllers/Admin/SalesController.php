<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\AuditLogService;
use App\Services\UnitConverterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::where('type', 'menu')
            ->with(['menuItems' => function ($q) {
                $q->where('is_available', true)->with('recipes.inventoryItem');
            }])
            ->get();

        $allMenuItems = MenuItem::where('is_available', true)->with('recipes.inventoryItem')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');
        $taxPercentage = (float)AppSetting::getByKey('tax_percentage', '5.0');

        $recentOrders = Order::with(['items.menuItem', 'creator'])
            ->paidOrCompleted()
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        $activeOrders = Order::with(['items.menuItem', 'creator'])
            ->whereIn('order_status', ['processing', 'ready', 'served'])
            ->orderByDesc('created_at')
            ->get();

        $settings = [
            'brand_name' => AppSetting::getByKey('brand_name', config('app.name', 'Restaurant')),
            'brand_logo' => AppSetting::getByKey('brand_logo', '/uploads/branding/logo.svg'),
            'brand_icon' => AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg'),
            'address' => AppSetting::getByKey('address', '889 Midnight Ave, Suite B, Downtown District'),
            'phone' => AppSetting::getByKey('phone', '+8801700000000'),
            'email' => AppSetting::getByKey('email', 'contact@restaurant.com'),
            'default_currency' => $currency,
            'tax_percentage' => $taxPercentage,
            'billing_payment_system' => AppSetting::getByKey('billing_payment_system', 'pay_after_service'),
        ];

        return Inertia::render('admin/sales/index', [
            'categories' => $categories,
            'allMenuItems' => $allMenuItems,
            'currency' => $currency,
            'taxPercentage' => $taxPercentage,
            'recentOrders' => $recentOrders,
            'activeOrders' => $activeOrders,
            'settings' => $settings,
        ]);
    }

    /**
     * Polling endpoint for real-time Active POS & Kitchen Orders sync (e.g. every 30s)
     */
    public function getActiveOrders(Request $request): JsonResponse
    {
        $activeOrders = Order::with(['items.menuItem', 'creator'])
            ->whereIn('order_status', ['processing', 'ready', 'served'])
            ->orderByDesc('created_at')
            ->get();

        $recentOrders = Order::with(['items.menuItem', 'creator'])
            ->paidOrCompleted()
            ->orderByDesc('created_at')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'activeOrders' => $activeOrders,
            'recentOrders' => $recentOrders,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_type' => 'required|in:dine_in,takeaway,delivery',
            'table_number' => 'nullable|string|max:50',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bkash,nagad,other',
            'transaction_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'action' => 'nullable|in:send_to_kitchen,quick_pay',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $isSendToKitchen = ($validated['action'] ?? 'send_to_kitchen') === 'send_to_kitchen';

        $order = DB::transaction(function () use ($validated, $isSendToKitchen) {
            $orderNumber = 'INV-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $menuItem = MenuItem::with('recipes')->findOrFail($item['menu_item_id']);
                $linePrice = $menuItem->price * $item['quantity'];
                $subtotal += $linePrice;

                $orderItemsData[] = [
                    'menu_item_id' => $menuItem->id,
                    'item_name' => $menuItem->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $linePrice,
                ];
            }

            $taxRate = (float)AppSetting::getByKey('tax_percentage', '5.0') / 100;
            $taxAmount = round($subtotal * $taxRate, 2);
            $discount = (float)($validated['discount_amount'] ?? 0);
            $totalAmount = max(0, $subtotal + $taxAmount - $discount);

            $orderStatus = $isSendToKitchen ? 'processing' : 'completed';
            $paymentStatus = $isSendToKitchen ? 'pending' : 'paid';

            $newOrder = Order::create([
                'order_number' => $orderNumber,
                'order_type' => $validated['order_type'],
                'order_status' => $orderStatus,
                'table_number' => $validated['table_number'] ?? null,
                'customer_name' => $validated['customer_name'] ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discount,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'transaction_id' => $validated['transaction_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => Auth::id(),
            ]);

            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $newOrder->id,
                    'menu_item_id' => $itemData['menu_item_id'],
                    'item_name' => $itemData['item_name'],
                    'quantity' => $itemData['quantity'],
                    'item_status' => 'processing',
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price'],
                ]);
            }

            $logAction = $isSendToKitchen ? "Sent KOT Order {$orderNumber} to Kitchen (Processing)" : "Created and paid sale invoice {$orderNumber} total: {$totalAmount}";
            AuditLogService::log($logAction, "sales");

            return $newOrder->load(['items', 'creator']);
        });

        if ($isSendToKitchen) {
            return redirect()->back()->with([
                'success' => "Order #{$order->order_number} sent to Kitchen KOT successfully!",
                'lastKotOrder' => $order,
            ]);
        }

        return redirect()->back()->with([
            'success' => 'Order completed & paid successfully.',
            'lastOrder' => $order,
        ]);
    }

    /**
     * Settle & complete an active dine-in / takeaway order, generating final full-page bill.
     */
    public function completeOrder(Order $order, Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,bkash,nagad,other',
            'discount_amount' => 'nullable|numeric|min:0',
            'transaction_id' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $subtotal = (float)$order->subtotal;
        $taxRate = (float)AppSetting::getByKey('tax_percentage', '5.0') / 100;
        $taxAmount = round($subtotal * $taxRate, 2);
        $discount = isset($validated['discount_amount']) ? (float)$validated['discount_amount'] : (float)$order->discount_amount;
        $totalAmount = max(0, $subtotal + $taxAmount - $discount);

        $order->update([
            'discount_amount' => $discount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'paid',
            'order_status' => 'completed',
            'transaction_id' => $validated['transaction_id'] ?? $order->transaction_id,
            'notes' => $validated['notes'] ?? $order->notes,
        ]);

        $order->items()->update(['item_status' => 'served']);

        AuditLogService::log("Completed and settled sale invoice {$order->order_number} total: {$totalAmount}", "sales");

        $fullOrder = $order->fresh(['items', 'creator']);

        return redirect()->back()->with([
            'success' => "Bill settled and order #{$order->order_number} marked completed!",
            'lastOrder' => $fullOrder,
        ]);
    }

    /**
     * Append additional dishes to an ongoing active order.
     */
    public function addItems(Order $order, Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $addedSubtotal = 0;
        foreach ($validated['items'] as $item) {
            $menuItem = MenuItem::findOrFail($item['menu_item_id']);
            $linePrice = $menuItem->price * $item['quantity'];
            $addedSubtotal += $linePrice;

            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $menuItem->id,
                'item_name' => $menuItem->name,
                'quantity' => $item['quantity'],
                'item_status' => 'processing',
                'unit_price' => $menuItem->price,
                'total_price' => $linePrice,
            ]);
        }

        $newSubtotal = (float)$order->subtotal + $addedSubtotal;
        $taxRate = (float)AppSetting::getByKey('tax_percentage', '5.0') / 100;
        $newTax = round($newSubtotal * $taxRate, 2);
        $newTotal = max(0, $newSubtotal + $newTax - (float)$order->discount_amount);

        $order->update([
            'subtotal' => $newSubtotal,
            'tax_amount' => $newTax,
            'total_amount' => $newTotal,
            'order_status' => 'processing', // Re-mark processing for kitchen
        ]);

        AuditLogService::log("Added " . count($validated['items']) . " new items to active order #{$order->order_number}", "sales");

        return redirect()->back()->with('success', "Added items to Order #{$order->order_number} and updated Kitchen KOT.");
    }

    /**
     * Cancel and remove an order if it is still in 'processing' status.
     */
    public function cancelOrder(Order $order, Request $request)
    {
        if ($order->order_status !== 'processing' && $order->order_status !== 'ready') {
            return redirect()->back()->with('error', "Only processing/unserved orders can be removed.");
        }

        $orderNum = $order->order_number;
        DB::transaction(function () use ($order, $orderNum) {
            $order->items()->delete();
            $order->delete();
            AuditLogService::log("Cancelled and removed processing order #{$orderNum}", "sales");
        });

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Order #{$orderNum} was cancelled and removed.",
            ]);
        }

        return redirect()->back()->with('success', "Order #{$orderNum} was cancelled and removed successfully.");
    }

    /**
     * Update order type and status (e.g. dine-in, take-away, delivery, completed) and generate bill if completed.
     */
    public function updateOrderStatus(Order $order, Request $request)
    {
        $validated = $request->validate([
            'order_type' => 'nullable|in:dine_in,takeaway,delivery',
            'order_status' => 'nullable|in:processing,ready,served,completed,cancelled',
            'payment_method' => 'nullable|in:cash,card,bkash,nagad,other',
            'discount_amount' => 'nullable|numeric|min:0',
            'table_number' => 'nullable|string|max:50',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:50',
        ]);

        $subtotal = (float)$order->subtotal;
        $taxRate = (float)AppSetting::getByKey('tax_percentage', '5.0') / 100;
        $taxAmount = round($subtotal * $taxRate, 2);
        $discount = isset($validated['discount_amount']) ? (float)$validated['discount_amount'] : (float)$order->discount_amount;
        $totalAmount = max(0, $subtotal + $taxAmount - $discount);

        $updates = [
            'discount_amount' => $discount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ];

        if (!empty($validated['order_type'])) {
            $updates['order_type'] = $validated['order_type'];
        }
        if (!empty($validated['table_number'])) {
            $updates['table_number'] = $validated['table_number'];
        }
        if (!empty($validated['customer_name'])) {
            $updates['customer_name'] = $validated['customer_name'];
        }
        if (!empty($validated['customer_phone'])) {
            $updates['customer_phone'] = $validated['customer_phone'];
        }
        if (!empty($validated['payment_method'])) {
            $updates['payment_method'] = $validated['payment_method'];
        }

        $isCompleting = false;
        if (!empty($validated['order_status'])) {
            $updates['order_status'] = $validated['order_status'];
            if ($validated['order_status'] === 'completed') {
                $updates['payment_status'] = 'paid';
                $isCompleting = true;
            }
        }

        // If order_type is delivery or takeaway and marked complete
        if (($order->order_type === 'delivery' || ($validated['order_type'] ?? '') === 'delivery') && ($validated['order_status'] ?? '') === 'completed') {
            $updates['payment_status'] = 'paid';
            $isCompleting = true;
        }

        $order->update($updates);

        if ($isCompleting) {
            $order->items()->update(['item_status' => 'served']);
        }

        AuditLogService::log("Updated order #{$order->order_number} to type: {$order->order_type}, status: {$order->order_status}", "sales");

        $fullOrder = $order->fresh(['items', 'creator']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Order #{$order->order_number} updated successfully.",
                'order' => $fullOrder,
                'generate_bill' => $isCompleting,
            ]);
        }

        $flash = [
            'success' => "Order #{$order->order_number} updated.",
        ];

        if ($isCompleting) {
            $flash['lastOrder'] = $fullOrder;
        }

        return redirect()->back()->with($flash);
    }

    public function ordersLog(Request $request): Response
    {
        $query = Order::with(['items', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%")
                  ->orWhere('table_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Default to Today if no date filters or search parameters are passed
        if (!$request->has('from_date') && !$request->has('to_date') && !$request->has('date') && !$request->has('search') && !$request->has('all_time')) {
            $fromDate = date('Y-m-d');
            $toDate = date('Y-m-d');
        }

        if (!empty($fromDate)) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if (!empty($toDate)) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        if ($request->filled('date') && empty($fromDate) && empty($toDate)) {
            $query->whereDate('created_at', $request->date);
        }

        // Calculate total sales sum for the current filtered query
        $totalSalesAmount = (float)(clone $query)->sum('total_amount');
        $totalSubtotal = (float)(clone $query)->sum('subtotal');
        $totalDiscount = (float)(clone $query)->sum('discount_amount');
        $totalTax = (float)(clone $query)->sum('tax_amount');

        $perPage = $request->input('per_page', 20);
        $orders = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();
        $currency = AppSetting::getByKey('default_currency', '৳');

        return Inertia::render('admin/sales/log', [
            'orders' => $orders,
            'totalSalesAmount' => $totalSalesAmount,
            'totalSubtotal' => $totalSubtotal,
            'totalDiscount' => $totalDiscount,
            'totalTax' => $totalTax,
            'currency' => $currency,
            'filters' => array_merge([
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ], $request->only(['search', 'order_type', 'payment_method', 'date', 'all_time'])),
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $query = Order::with('items');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $fromDate = $request->input('from_date');
        $toDate   = $request->input('to_date');

        if (!empty($fromDate)) {
            $query->whereDate('created_at', '>=', $fromDate);
        }
        if (!empty($toDate)) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        if ($request->input('all_time') !== '1' && empty($fromDate) && empty($toDate)) {
            $fromDate = date('Y-m-d');
            $toDate   = date('Y-m-d');
            $query->whereDate('created_at', date('Y-m-d'));
        }

        $orders   = $query->orderByDesc('created_at')->get();
        $currency = AppSetting::getByKey('default_currency', '৳');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sales Log');

        // Title
        $sheet->setCellValue('A1', 'SALES ORDERS AUDIT LOG');
        $sheet->mergeCells('A1:H1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $rangeLabel = ($fromDate || $toDate)
            ? (($fromDate ?: 'All') . ' to ' . ($toDate ?: 'Now'))
            : 'All Time';
        $sheet->setCellValue('A2', 'Date Range: ' . $rangeLabel . ' | Exported: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A2:H2');

        // Column headers
        $cols = ['Order #', 'Type', 'Table', 'Date & Time', 'Payment Method', 'Subtotal', 'Discount', 'Tax', 'Total Paid'];
        foreach ($cols as $i => $col) {
            $letter = chr(65 + $i);
            $sheet->setCellValue($letter . '4', $col);
            $sheet->getStyle($letter . '4')->getFont()->setBold(true);
        }

        $row = 5;
        $totalSubtotal = 0;
        $totalDiscount = 0;
        $totalTax      = 0;
        $totalPaid     = 0;

        foreach ($orders as $order) {
            $sheet->setCellValue('A' . $row, '#' . $order->order_number);
            $sheet->setCellValue('B' . $row, ucfirst(str_replace('_', ' ', $order->order_type)));
            $sheet->setCellValue('C' . $row, $order->table_number ?? '-');
            $sheet->setCellValue('D' . $row, $order->created_at ? $order->created_at->format('Y-m-d H:i') : '');
            $sheet->setCellValue('E' . $row, strtoupper($order->payment_method));
            $sheet->setCellValue('F' . $row, (float)$order->subtotal);
            $sheet->setCellValue('G' . $row, (float)$order->discount_amount);
            $sheet->setCellValue('H' . $row, (float)$order->tax_amount);
            $sheet->setCellValue('I' . $row, (float)$order->total_amount);

            foreach (['F', 'G', 'H', 'I'] as $numCol) {
                $sheet->getStyle($numCol . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            }

            $totalSubtotal += (float)$order->subtotal;
            $totalDiscount += (float)$order->discount_amount;
            $totalTax      += (float)$order->tax_amount;
            $totalPaid     += (float)$order->total_amount;

            $row++;
        }

        // Totals row
        $row++;
        $sheet->setCellValue('E' . $row, 'TOTALS:');
        $sheet->getStyle('E' . $row)->getFont()->setBold(true);
        $sheet->setCellValue('F' . $row, $totalSubtotal);
        $sheet->setCellValue('G' . $row, $totalDiscount);
        $sheet->setCellValue('H' . $row, $totalTax);
        $sheet->setCellValue('I' . $row, $totalPaid);
        foreach (['F', 'G', 'H', 'I'] as $numCol) {
            $sheet->getStyle($numCol . $row)->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle($numCol . $row)->getFont()->setBold(true);
        }

        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'Sales_Log_' . date('Y-m-d') . '.xlsx';
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
