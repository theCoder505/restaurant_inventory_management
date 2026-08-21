import AppLayout from '@/layouts/app-layout';
import PosReceipt from '@/components/receipt/pos-receipt';
import { printReceipt } from '@/lib/print-receipt';
import { formatCurrency, formatDateTime, showAlert, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CreditCard, DollarSign, History, Loader2, Minus, Plus, Printer, Receipt, Search, ShoppingCart, Trash2, Utensils, X } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    name: string;
    category_id: number;
    description?: string;
    price: number;
    image_path?: string;
    is_available: boolean;
}

interface CartItem {
    menu_item_id: number;
    name: string;
    image_path?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    id: number;
    order_number: string;
    order_type: string;
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount?: number;
    grand_total?: number;
    payment_method: string;
    payment_status?: string;
    transaction_id?: string;
    notes?: string;
    created_at: string;
    creator?: {
        name?: string;
    };
    items?: Array<{
        id?: number;
        item_name?: string;
        name?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

interface Props {
    categories: Category[];
    allMenuItems: MenuItem[];
    currency: string;
    taxPercentage: number;
    recentOrders?: Order[];
    settings?: {
        brand_name?: string;
        brand_logo?: string;
        brand_icon?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'POS Billing & Sales', href: '/administration-control/sales' },
];

export default function SalesPOS({ categories, allMenuItems, currency, taxPercentage, recentOrders = [], settings = {} }: Props) {
    const { branding } = usePage<{ branding?: any }>().props;
    const activeBranding = { ...settings, ...(branding || {}) };

    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showRecentOrders, setShowRecentOrders] = useState(false);

    // Completed Order Modal / Receipt Modal
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

    // POS Checkout Form
    const orderForm = useForm({
        order_type: 'dine_in',
        table_number: 'Table 1',
        customer_name: '',
        customer_phone: '',
        payment_method: 'cash',
        discount_amount: 0,
        transaction_id: '',
        notes: '',
        items: [] as { menu_item_id: number; quantity: number; unit_price: number }[],
    });

    const filteredMenuItems = allMenuItems.filter((item) => {
        const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const addToCart = (dish: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.menu_item_id === dish.id);
            if (existing) {
                return prev.map((i) =>
                    i.menu_item_id === dish.id ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price } : i,
                );
            }
            return [
                ...prev,
                {
                    menu_item_id: dish.id,
                    name: dish.name,
                    image_path: dish.image_path,
                    quantity: 1,
                    unit_price: dish.price,
                    total_price: dish.price,
                },
            ];
        });
    };

    const updateQuantity = (menuItemId: number, delta: number) => {
        setCart(
            (prev) =>
                prev
                    .map((item) => {
                        if (item.menu_item_id === menuItemId) {
                            const newQty = item.quantity + delta;
                            if (newQty <= 0) return null;
                            return {
                                ...item,
                                quantity: newQty,
                                total_price: newQty * item.unit_price,
                            };
                        }
                        return item;
                    })
                    .filter(Boolean) as CartItem[],
        );
    };

    const removeFromCart = (menuItemId: number) => {
        setCart((prev) => prev.filter((i) => i.menu_item_id !== menuItemId));
    };

    const clearCart = () => setCart([]);

    // Subtotal, Tax, Discount & Total Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const discountAmount = parseFloat(orderForm.data.discount_amount as any) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            showAlert('Cart is Empty!', 'Please select dishes before completing billing.', 'warning');
            return;
        }

        setIsCheckingOut(true);
        const payload = {
            ...orderForm.data,
            items: cart.map((i) => ({
                menu_item_id: i.menu_item_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
            })),
        };

        router.post('/administration-control/sales', payload, {
            onSuccess: (page) => {
                showToast('Sale Order Completed & Stock Deducted!', 'success');
                clearCart();
                orderForm.reset();
                const latestOrder = (page.props as any).flash?.lastOrder || (page.props as any).flash?.order;
                if (latestOrder) {
                    setCompletedOrder(latestOrder);
                    // Automatically trigger money receipt print for POS machine
                    setTimeout(() => {
                        printReceipt(latestOrder, activeBranding, currency);
                    }, 250);
                }
            },
            onError: () => {
                showToast('Failed to process sale. Please check details.', 'error');
            },
            onFinish: () => {
                setIsCheckingOut(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point of Sale (POS) Billing" />

            <div className="flex min-h-[calc(100vh-75px)] w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden lg:flex-row dark:bg-slate-950 dark:text-slate-100">
                {/* Left Section: Dish Menu & Categories */}
                <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                <ShoppingCart className="h-6 w-6 text-amber-500" /> POS Billing Terminal
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Fast order creation with auto-ingredient recipe stock deduction & instant money receipt printing
                            </p>
                        </div>
                        {recentOrders.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowRecentOrders(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-amber-500/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
                            >
                                <History className="h-4 w-4 text-amber-500" /> Recent Receipts ({recentOrders.length})
                            </button>
                        )}
                    </div>

                    {/* Search & Category Filter */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>

                        <div className="flex items-center flex-wrap gap-2 overflow-x-auto pb-1 text-xs">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`rounded-xl px-3.5 py-1.5 font-bold whitespace-nowrap transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                All Items ({allMenuItems.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`rounded-xl px-3.5 py-1.5 font-bold whitespace-nowrap transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dish Cards Grid */}
                    <div className="grid max-h-[calc(100vh-280px)] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
                        {filteredMenuItems.map((dish) => (
                            <button
                                key={dish.id}
                                onClick={() => addToCart(dish)}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-amber-500/50 active:scale-95 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="space-y-1.5">
                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                        {dish.image_path ? (
                                            <img src={dish.image_path} alt={dish.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
                                                <Utensils className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="line-clamp-1 text-xs font-bold text-slate-900 transition-colors group-hover:text-amber-500 dark:text-slate-100">
                                        {dish.name}
                                    </h4>
                                </div>
                                <div className="mt-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                                    {formatCurrency(dish.price, currency)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Section: Order Cart & Checkout Panel */}
                <div className="flex w-full shrink-0 flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-96 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <Receipt className="h-4 w-4 text-amber-500" /> Current Order Items ({cart.length})
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={clearCart} className="text-[10px] font-semibold text-rose-500 hover:text-rose-400">
                                    Clear Cart
                                </button>
                            )}
                        </div>

                        {/* Order Type & Table / Customer Details */}
                        <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 block text-[10px] text-slate-500">Order Type</label>
                                    <select
                                        value={orderForm.data.order_type}
                                        onChange={(e) => orderForm.setData('order_type', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        <option value="dine_in">Dine-In</option>
                                        <option value="takeaway">Takeaway</option>
                                        <option value="delivery">Delivery</option>
                                    </select>
                                </div>

                                {orderForm.data.order_type === 'dine_in' ? (
                                    <div>
                                        <label className="mb-1 block text-[10px] text-slate-500">Table Number</label>
                                        <input
                                            type="text"
                                            value={orderForm.data.table_number}
                                            onChange={(e) => orderForm.setData('table_number', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="mb-1 block text-[10px] text-slate-500">Customer Name</label>
                                        <input
                                            type="text"
                                            placeholder="Optional"
                                            value={orderForm.data.customer_name}
                                            onChange={(e) => orderForm.setData('customer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-[10px] text-slate-500">Order Note / Instructions</label>
                                <input
                                    type="text"
                                    placeholder="Special instructions or notes..."
                                    value={orderForm.data.notes}
                                    onChange={(e) => orderForm.setData('notes', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        {/* Cart Line Items */}
                        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-600">
                                    Click on menu dishes to add to billing cart.
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.menu_item_id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                                                {item.image_path ? (
                                                    <img src={item.image_path} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-amber-500">
                                                        <Utensils className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="block font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    {formatCurrency(item.unit_price, currency)} x {item.quantity}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                                <button
                                                    onClick={() => updateQuantity(item.menu_item_id, -1)}
                                                    className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.menu_item_id, 1)}
                                                    className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.menu_item_id)}
                                                className="p-1 text-rose-500 hover:text-rose-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Financial Summary & Payment Options */}
                    <form onSubmit={handleCheckout} className="space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
                        <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT / Tax ({taxPercentage}%)</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(taxAmount, currency)}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={orderForm.data.discount_amount}
                                    onChange={(e) => orderForm.setData('discount_amount', parseFloat(e.target.value) || 0)}
                                    className="w-24 text-center rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-950"
                                />
                            </div>

                            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900 dark:border-slate-800 dark:text-slate-100">
                                <span>Grand Total</span>
                                <span className="text-amber-600 dark:text-amber-400">{formatCurrency(grandTotal, currency)}</span>
                            </div>
                        </div>

                        {/* Payment Method selection */}
                        <div>
                            <label className="mb-1 block text-[10px] text-slate-500">Payment Method</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {[
                                    { id: 'cash', label: 'Cash', icon: DollarSign },
                                    { id: 'card', label: 'Card', icon: CreditCard },
                                    { id: 'bkash', label: 'bKash', icon: Receipt },
                                    { id: 'nagad', label: 'Nagad', icon: Receipt },
                                ].map((pm) => (
                                    <button
                                        type="button"
                                        key={pm.id}
                                        onClick={() => orderForm.setData('payment_method', pm.id)}
                                        className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-bold transition-all ${
                                            orderForm.data.payment_method === pm.id
                                                ? 'border-amber-500 bg-amber-500 text-slate-950 shadow'
                                                : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <pm.icon className="h-3.5 w-3.5" />
                                        {pm.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cart.length === 0 || orderForm.processing || isCheckingOut}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isCheckingOut || orderForm.processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Completing Sale & Deducting Stock...</span>
                                </>
                            ) : (
                                <>
                                    <Printer className="h-4 w-4" />
                                    <span>Complete Sale & Print Receipt</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Printable Money Receipt Modal (Reference Design) */}
                {completedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="relative max-h-[95vh] overflow-y-auto w-full max-w-[360px]">
                            <PosReceipt
                                order={completedOrder as any}
                                branding={activeBranding}
                                currency={currency}
                                onClose={() => setCompletedOrder(null)}
                            />
                        </div>
                    </div>
                )}

                {/* Recent Orders Modal / Drawer */}
                {showRecentOrders && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Recent POS Sales & Receipts
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowRecentOrders(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className="py-8 text-center text-xs text-slate-500">
                                        No recent orders found.
                                    </p>
                                ) : (
                                    recentOrders.map((ro) => (
                                        <div
                                            key={ro.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                                                        {ro.order_number}
                                                    </span>
                                                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                        {ro.table_number || ro.order_type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500">
                                                    {formatDateTime(ro.created_at)} • {ro.items?.length || 0} items
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(ro.total_amount ?? ro.grand_total ?? 0, currency)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowRecentOrders(false);
                                                        setCompletedOrder(ro);
                                                    }}
                                                    className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow hover:bg-amber-400 cursor-pointer"
                                                >
                                                    <Printer className="h-3.5 w-3.5" /> Receipt
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="border-t border-slate-200 p-3 text-right dark:border-slate-800">
                                <button
                                    onClick={() => setShowRecentOrders(false)}
                                    className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}