import AppLayout from '@/layouts/app-layout';
import FullPageBill from '@/components/receipt/full-page-bill';
import { printBothReceipts } from '@/lib/print-receipt';
import { formatCurrency, formatDateTime, showAlert, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    CreditCard,
    DollarSign,
    History,
    Loader2,
    Minus,
    Plus,
    Printer,
    Receipt,
    Search,
    ShoppingCart,
    Trash2,
    Utensils,
    X,
    ChefHat,
    CheckCircle2,
    Clock,
    ArrowRight,
    RefreshCw,
    Volume2,
    VolumeX,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
    order_type: 'dine_in' | 'takeaway' | 'delivery';
    order_status: 'processing' | 'ready' | 'served' | 'completed' | 'cancelled';
    table_number?: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    discount_note?: string;
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
        item_status?: string;
        unit_price: number;
        total_price: number;
        kitchen_code?: string;
    }>;
}

interface Props {
    categories: Category[];
    allMenuItems: MenuItem[];
    currency: string;
    taxPercentage: number;
    activeOrders?: Order[];
    settings?: {
        brand_name?: string;
        brand_logo?: string;
        brand_icon?: string;
        address?: string;
        phone?: string;
        email?: string;
        tagline?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'POS Billing & Sales', href: '/administration-control/sales' },
];

export default function SalesPOS({
    categories,
    allMenuItems,
    currency,
    taxPercentage,
    activeOrders: initialActiveOrders = [],
    settings = {},
}: Props) {
    const { branding } = usePage<{ branding?: any }>().props;
    const activeBranding = { ...settings, ...(branding || {}) };

    const [activeOrders, setActiveOrders] = useState<Order[]>(initialActiveOrders);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [secondsToNextPoll, setSecondsToNextPoll] = useState(30);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showActiveOrders, setShowActiveOrders] = useState(false);

    // Settlement & Manage Modal for Active Dining Orders
    const [settlingOrder, setSettlingOrder] = useState<Order | null>(null);
    const [settleOrderType, setSettleOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
    const [settleOrderStatus, setSettleOrderStatus] = useState<Order['order_status']>('processing');
    const [settlePaymentMethod, setSettlePaymentMethod] = useState('cash');
    const [settleDiscount, setSettleDiscount] = useState<number>(0);
    const [settleTransactionId, setSettleTransactionId] = useState('');
    const [isSettling, setIsSettling] = useState(false);

    // Completed Order Modal / Bill Modal
    const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

    const prevActiveOrderIdsRef = useRef<number[]>(initialActiveOrders.map((o) => o.id));
    const prevReadyOrderIdsRef = useRef<number[]>(
        initialActiveOrders.filter((o) => o.order_status === 'ready').map((o) => o.id),
    );

    // Sync state when Inertia navigation or server responses update props
    useEffect(() => {
        setActiveOrders(initialActiveOrders);
    }, [initialActiveOrders]);


    // Audio chime on new order or when kitchen marks order as 'ready'
    const playChime = () => {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.45);
        } catch (e) {
            // Audio context blocked or not available
        }
    };

    // Auto-polling & manual fetch function (every 30s)
    const fetchLatestOrders = async (manual = false) => {
        if (manual) setIsRefreshing(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/administration-control/sales/active-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    const newActiveOrders: Order[] = data.activeOrders || [];

                    const newActiveIds = newActiveOrders.map((o) => o.id);
                    const newReadyOrders = newActiveOrders.filter((o) => o.order_status === 'ready');
                    const newReadyIds = newReadyOrders.map((o) => o.id);

                    // Check if any order was just marked 'ready' by kitchen
                    const newlyReady = newReadyOrders.filter((o) => !prevReadyOrderIdsRef.current.includes(o.id));
                    if (newlyReady.length > 0 && prevReadyOrderIdsRef.current.length >= 0) {
                        playChime();
                        newlyReady.forEach((ro) => {
                            showToast(
                                `Order #${ro.order_number} (${ro.table_number || ro.order_type.toUpperCase()}) is READY to serve!`,
                                'info',
                            );
                        });
                    }

                    // Check if a new active order arrived from another terminal
                    const hasNewOrders = newActiveOrders.some((o) => !prevActiveOrderIdsRef.current.includes(o.id));
                    if (hasNewOrders && prevActiveOrderIdsRef.current.length > 0 && newlyReady.length === 0) {
                        playChime();
                        showToast('New Active Order received in POS queue!', 'info');
                    }

                    prevActiveOrderIdsRef.current = newActiveIds;
                    prevReadyOrderIdsRef.current = newReadyIds;
                    setActiveOrders(newActiveOrders);

                    // Keep active modal in sync if open
                    setSettlingOrder((current) => {
                        if (!current) return null;
                        const matching = newActiveOrders.find((o) => o.id === current.id);
                        return matching ? { ...current, ...matching } : current;
                    });

                    if (manual) {
                        showToast('Active orders & status refreshed!', 'success');
                    }
                }
            } else if (manual) {
                router.reload({
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => showToast('Orders reloaded successfully.', 'success'),
                });
            }
        } catch (err) {
            console.error('POS active orders polling error', err);
            if (manual) {
                router.reload({
                    preserveScroll: true,
                    preserveState: true,
                });
            }
        } finally {
            setSecondsToNextPoll(30);
            if (manual) setTimeout(() => setIsRefreshing(false), 400);
        }
    };

    // 30s Interval + 1s countdown timer
    useEffect(() => {
        const countdownTimer = setInterval(() => {
            setSecondsToNextPoll((prev) => {
                if (prev <= 1) {
                    fetchLatestOrders(false);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownTimer);
    }, [soundEnabled]);

    // POS Checkout Form
    const orderForm = useForm({
        order_type: 'dine_in' as 'dine_in' | 'takeaway' | 'delivery',
        table_number: 'Table 1',
        customer_name: '',
        customer_phone: '',
        payment_method: 'cash',
        discount_amount: 0,
        discount_note: '',
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
                    i.menu_item_id === dish.id
                        ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
                        : i,
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

    // Handle Order Submission -> Generates Dual Bills (Kitchen KOT + Customer Bill)
    const handleOrderSubmit = () => {
        if (cart.length === 0) {
            showAlert('Cart is Empty!', 'Please select dishes from menu before proceeding.', 'warning');
            return;
        }

        // Snapshot current order details so fallback printing is 100% reliable
        const currentCart = [...cart];
        const currentOrderFormData = { ...orderForm.data };
        const currentSubtotal = subtotal;
        const currentTaxAmount = taxAmount;
        const currentDiscountAmount = discountAmount;
        const currentGrandTotal = grandTotal;

        setIsCheckingOut(true);
        const payload = {
            ...currentOrderFormData,
            items: currentCart.map((i) => ({
                menu_item_id: i.menu_item_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
            })),
        };

        router.post('/administration-control/sales', payload, {
            onSuccess: (page) => {
                clearCart();
                orderForm.reset();

                const flashOrder = (page.props as any)?.flash?.lastPlacedOrder || (page.props as any)?.flash?.lastOrder;

                const orderToPrint = (flashOrder && Array.isArray(flashOrder.items) && flashOrder.items.length > 0)
                    ? flashOrder
                    : {
                        id: flashOrder?.id || Date.now(),
                        order_number: flashOrder?.order_number || ('INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000)),
                        order_type: currentOrderFormData.order_type || 'dine_in',
                        table_number: currentOrderFormData.table_number || '',
                        customer_name: currentOrderFormData.customer_name || 'Walk-in Customer',
                        customer_phone: currentOrderFormData.customer_phone || '',
                        subtotal: currentSubtotal,
                        tax_amount: currentTaxAmount,
                        discount_amount: currentDiscountAmount,
                        discount_note: currentOrderFormData.discount_note || '',
                        total_amount: currentGrandTotal,
                        payment_method: currentOrderFormData.payment_method || 'cash',
                        payment_status: ((settings as any)?.billing_payment_system === 'pay_first' ? 'paid' : 'unpaid'),
                        items: currentCart.map((c) => ({
                            item_name: c.menu_item.name,
                            name: c.menu_item.name,
                            kitchen_code: (c.menu_item as any).kitchen_code || '',
                            quantity: c.quantity,
                            unit_price: c.unit_price,
                            total_price: c.total_price,
                        })),
                        created_at: new Date().toISOString(),
                    };

                showToast('Order Placed! Printing 2 Slips: 1 KOT & 1 Customer...', 'success');
                printBothReceipts(orderToPrint, activeBranding, currency);
                fetchLatestOrders(false);
            },
            onError: () => {
                showToast('Failed to process order. Please verify details.', 'error');
            },
            onFinish: () => {
                setIsCheckingOut(false);
            },
        });
    };

    // Cancel / Remove Order if still processing
    const handleCancelOrder = async (orderId: number, orderNumber: string) => {
        const confirmed = await showConfirm(
            `Cancel Order #${orderNumber}?`,
            'This will permanently remove the order from both Kitchen and POS queues.',
            'Yes, cancel order',
        );

        if (confirmed) {
            router.delete(`/administration-control/sales/${orderId}/cancel`, {
                onSuccess: () => {
                    showToast(`Order #${orderNumber} was cancelled and removed.`, 'success');
                    if (settlingOrder?.id === orderId) {
                        setSettlingOrder(null);
                    }
                    fetchLatestOrders(false);
                },
                onError: () => {
                    showToast('Failed to cancel order.', 'error');
                },
            });
        }
    };

    // Open Modal for Kitchen & Serving Status Update
    const openSettlementModal = (order: Order) => {
        setSettlingOrder(order);
        setSettleOrderStatus(order.order_status || 'processing');
        setSettlePaymentMethod(order.payment_method || 'cash');
        setSettleDiscount((order.discount_amount as any) || 0);
        setSettleTransactionId(order.transaction_id || '');
    };

    // Complete Active Order (No bill generated here, just marks Complete)
    const handleSettleComplete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!settlingOrder) return;

        setIsSettling(true);
        const payload = {
            order_status: 'completed', // Explicitly complete
            payment_method: settlePaymentMethod,
            transaction_id: settleTransactionId,
        };

        router.post(`/administration-control/sales/${settlingOrder.id}/update-order-status`, payload, {
            onSuccess: () => {
                showToast(`Order #${settlingOrder.order_number} marked Complete!`, 'success');
                setSettlingOrder(null);
                fetchLatestOrders(false);
            },
            onError: () => {
                showToast('Failed to complete order.', 'error');
            },
            onFinish: () => {
                setIsSettling(false);
            },
        });
    };

    // Quick Status Update (Kitchen & Serving Status)
    const handleQuickStatusChange = (newStatus: 'processing' | 'ready' | 'served') => {
        if (!settlingOrder) return;
        setIsSettling(true);
        router.post(
            `/administration-control/sales/${settlingOrder.id}/update-order-status`,
            {
                order_status: newStatus,
            },
            {
                onSuccess: () => {
                    showToast(`Kitchen status updated to ${newStatus.toUpperCase()}`, 'success');
                    setSettleOrderStatus(newStatus);
                    fetchLatestOrders(false);
                },
                onFinish: () => setIsSettling(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Point of Sale (POS) Billing" />

            <div className="flex min-h-[calc(100vh-75px)] w-full max-w-full min-w-0 flex-col gap-5 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Top Control Bar: POS Title, Active KOT Tables Badge & Actions */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <ShoppingCart className="h-6 w-6 text-amber-500" /> POS Billing Terminal
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Order Routing</span>
                            <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-bold text-amber-600 dark:text-amber-400">Kitchen KOT (Processing)</span>
                            <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                            <span>Dine-In / Takeaway</span>
                            <ArrowRight className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">Complete</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Auto-sync countdown and manual reload button */}
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                            <button
                                type="button"
                                onClick={() => fetchLatestOrders(true)}
                                disabled={isRefreshing}
                                className="flex items-center gap-1.5 font-bold hover:text-amber-500 transition-colors cursor-pointer disabled:opacity-50"
                                title="Click to manually refresh active and recent orders"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{isRefreshing ? 'Syncing...' : 'Reload'}</span>
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400" title="Auto-refreshes every 30 seconds">
                                Auto-sync in <strong className="text-amber-500 font-bold">{secondsToNextPoll}s</strong>
                            </span>
                        </div>

                        {/* Sound Alert Toggle */}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                            title={soundEnabled ? 'Order Audio Chime Enabled' : 'Audio Muted'}
                        >
                            {soundEnabled ? (
                                <Volume2 className="h-4 w-4 text-amber-500" />
                            ) : (
                                <VolumeX className="h-4 w-4 text-slate-400" />
                            )}
                        </button>

                        {/* Active KOT Tables Drawer Button */}
                        <button
                            type="button"
                            onClick={() => setShowActiveOrders(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm transition-all hover:bg-amber-500/20 cursor-pointer"
                        >
                            <ChefHat className="h-4 w-4 text-amber-500" />
                            <span>Active Orders ({activeOrders.length})</span>
                            {activeOrders.some((o) => o.order_status === 'ready') && (
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            )}
                        </button>
                        {/* Direct Link to KOT Display */}
                        <a
                            href="/kitchen"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            <ChefHat className="h-4 w-4 text-amber-400" /> Open KOT Screen
                        </a>
                    </div>
                </div>

                {/* Live Active Tables Quick Bar with Remove / Cancel Button for Processing Orders */}
                {activeOrders.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 dark:border-amber-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                    <Clock className="h-3.5 w-3.5" /> Live Active Orders & Tables ({activeOrders.length}):
                                </span>
                                {activeOrders.some((o) => o.order_status === 'ready') && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 animate-pulse">
                                        🔔 Dishes Ready to Serve!
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-slate-500">
                                Click order to change status or Settle & Print Full Bill
                            </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {activeOrders.map((ao) => {
                                const isReady = ao.order_status === 'ready';
                                const isServed = ao.order_status === 'served';
                                const isProcessing = ao.order_status === 'processing';

                                return (
                                    <div
                                        key={ao.id}
                                        className={`flex shrink-0 items-center gap-2 rounded-xl border p-2 text-left text-xs transition-all shadow-sm ${
                                            isReady
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                : isServed
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                : 'border-amber-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => openSettlementModal(ao)}
                                            className="text-left cursor-pointer"
                                        >
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span>{ao.table_number || ao.order_type.toUpperCase()}</span>
                                                <span
                                                    className={`rounded-md px-1.5 py-0.2 text-[9px] font-black uppercase ${
                                                        isReady
                                                            ? 'bg-emerald-500 text-white'
                                                            : isServed
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-amber-500 text-slate-950'
                                                    }`}
                                                >
                                                    {ao.order_status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {ao.items?.length || 0} items • {formatCurrency(ao.total_amount || 0, currency)}
                                            </div>
                                        </button>

                                        {/* Remove / Cancel button if in processing status */}
                                        {isProcessing && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelOrder(ao.id, ao.order_number)}
                                                className="rounded-lg p-1 text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                                                title="Cancel & Remove Processing Order"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => openSettlementModal(ao)}
                                            className="rounded-lg p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                                            title="Settle Bill"
                                        >
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main POS Split Layout: Dishes on Left, Cart on Right */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Left Section: Dish Menu & Categories */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Search & Category Filter */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search dishes by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>

                            <div className="flex items-center flex-wrap gap-2 overflow-x-auto pb-1 text-xs">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`rounded-xl px-3.5 py-1.5 font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                                        className={`rounded-xl px-3.5 py-1.5 font-bold whitespace-nowrap transition-all cursor-pointer ${
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
                        <div className="grid max-h-[calc(100vh-320px)] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-4">
                            {filteredMenuItems.map((dish) => (
                                <button
                                    key={dish.id}
                                    onClick={() => addToCart(dish)}
                                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md active:scale-95 dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
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

                    {/* Right Section: Order Cart & Dual-Action Checkout Panel */}
                    <div className="flex w-full shrink-0 flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-96 dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                    <Receipt className="h-4 w-4 text-amber-500" /> Current Order ({cart.length})
                                </h3>
                                {cart.length > 0 && (
                                    <button onClick={clearCart} className="text-[10px] font-semibold text-rose-500 hover:text-rose-400 cursor-pointer">
                                        Clear Cart
                                    </button>
                                )}
                            </div>

                            {/* Order Type & Table Selection */}
                            <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="mb-1 block text-[10px] text-slate-500 font-bold">Order Type</label>
                                        <select
                                            value={orderForm.data.order_type}
                                            onChange={(e) => orderForm.setData('order_type', e.target.value as any)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="dine_in">Dine-In</option>
                                            <option value="takeaway">Takeaway</option>
                                            <option value="delivery">Delivery</option>
                                        </select>
                                    </div>

                                    {orderForm.data.order_type === 'dine_in' ? (
                                        <div>
                                            <label className="mb-1 block text-[10px] text-slate-500 font-bold">Table Number</label>
                                            <input
                                                type="text"
                                                value={orderForm.data.table_number}
                                                onChange={(e) => orderForm.setData('table_number', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-1 block text-[10px] text-slate-500 font-bold">Customer Name</label>
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
                                    <label className="mb-1 block text-[10px] text-slate-500">Chef Instructions / Notes</label>
                                    <input
                                        type="text"
                                        placeholder="Special notes (e.g. less spicy)..."
                                        value={orderForm.data.notes}
                                        onChange={(e) => orderForm.setData('notes', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>
                            </div>

                            {/* Cart Line Items */}
                            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                {cart.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-600">
                                        Click menu dishes on the left to add items.
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div
                                            key={item.menu_item_id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div>
                                                <span className="block font-bold text-slate-900 dark:text-slate-100">{item.name}</span>
                                                <span className="text-[10px] text-slate-500">
                                                    {formatCurrency(item.unit_price, currency)} x {item.quantity}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                                    <button
                                                        onClick={() => updateQuantity(item.menu_item_id, -1)}
                                                        className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="px-1.5 text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menu_item_id, 1)}
                                                        className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.menu_item_id)}
                                                    className="p-1 text-rose-500 hover:text-rose-400 cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Financial Totals & Action Buttons */}
                        {/* Financial Totals, Discount Note & Action Button */}
                        <div className="space-y-3 border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
                            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal, currency)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>VAT / Tax ({taxPercentage}%)</span>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(taxAmount, currency)}</span>
                                </div>

                                {/* Discount & Discount Note */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Discount ({currency})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            value={orderForm.data.discount_amount}
                                            onChange={(e) => orderForm.setData('discount_amount', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Discount Note</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. VIP, Staff Promo"
                                            value={orderForm.data.discount_note}
                                            onChange={(e) => orderForm.setData('discount_note', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-black text-slate-900 dark:border-slate-800 dark:text-slate-100">
                                    <span>Total Amount</span>
                                    <span className="text-amber-600 dark:text-amber-400">{formatCurrency(grandTotal, currency)}</span>
                                </div>
                            </div>

                            {/* Payment Configuration (Pay First vs Pay After Service) */}
                            {((settings as any)?.billing_payment_system === 'pay_first') ? (
                                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment Method</label>
                                        <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Pay First Policy</span>
                                    </div>
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
                                                className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                                    orderForm.data.payment_method === pm.id
                                                        ? 'border-amber-500 bg-amber-500 text-slate-950 shadow'
                                                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                                                }`}
                                            >
                                                <pm.icon className="h-3.5 w-3.5" />
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Policy: 'Pay After Service' (Payment settled upon order completion)
                                </div>
                            )}

                            {/* Order Submission Button */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={handleOrderSubmit}
                                    disabled={cart.length === 0 || isCheckingOut}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    {isCheckingOut ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Printer className="h-4 w-4" />
                                    )}
                                    <span>Place Order & Print 2 Slips (KOT & Customer)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settle & Manage Order Modal (Status changing & Mark Complete, no bill re-generation) */}
                {settlingOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                            Order #{settlingOrder.order_number} Management
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            {settlingOrder.table_number || settlingOrder.order_type.toUpperCase()} • Current Status:{' '}
                                            <strong className="text-amber-500 uppercase">{settlingOrder.order_status}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettlingOrder(null)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Kitchen & Serving Status Selector */}
                            <div className="space-y-1 text-xs">
                                <label className="block text-[10px] text-slate-500 font-bold">Kitchen & Serving Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleQuickStatusChange('processing')}
                                        className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                                            settleOrderStatus === 'processing'
                                                ? 'border-amber-500 bg-amber-500 text-slate-950 shadow'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                                        }`}
                                    >
                                        🍳 Processing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickStatusChange('ready')}
                                        className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                                            settleOrderStatus === 'ready'
                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                                        }`}
                                    >
                                        🔔 Ready
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleQuickStatusChange('served')}
                                        className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                                            settleOrderStatus === 'served'
                                                ? 'border-blue-500 bg-blue-500 text-white shadow'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                                        }`}
                                    >
                                        🍽️ Served
                                    </button>
                                </div>
                            </div>

                            {/* Order Dishes List */}
                            <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-950">
                                {settlingOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                                        <span>{item.quantity}x {item.item_name}</span>
                                        <span className="font-bold">{formatCurrency(item.total_price, currency)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Completion Form (Payment collection if Pay After Service) */}
                            <form onSubmit={handleSettleComplete} className="space-y-3 text-xs">
                                {((settings as any)?.billing_payment_system === 'pay_after_service') ? (
                                    <div className="space-y-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                                        <label className="block text-[10px] text-slate-500 font-bold">Select Payment Method (To Complete)</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'cash', label: 'Cash', icon: DollarSign },
                                                { id: 'card', label: 'Card', icon: CreditCard },
                                                { id: 'bkash', label: 'bKash', icon: Receipt },
                                                { id: 'nagad', label: 'Nagad', icon: Receipt },
                                            ].map((pm) => (
                                                <button
                                                    type="button"
                                                    key={pm.id}
                                                    onClick={() => setSettlePaymentMethod(pm.id)}
                                                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-bold transition-all cursor-pointer ${
                                                        settlePaymentMethod === pm.id
                                                            ? 'border-amber-500 bg-amber-500 text-slate-950 shadow'
                                                            : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <pm.icon className="h-4 w-4" />
                                                    {pm.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 font-bold mb-1">Transaction Ref (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                value={settleTransactionId}
                                                onChange={(e) => setSettleTransactionId(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-center text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                        Payment Settled upon Ordering ({settlingOrder.payment_method?.toUpperCase() || 'PAID'})
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                    {/* Cancel Processing Order Button */}
                                    {(settlingOrder.order_status === 'processing' || settlingOrder.order_status === 'ready') ? (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelOrder(settlingOrder.id, settlingOrder.order_number)}
                                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>Cancel Order</span>
                                        </button>
                                    ) : <div />}

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCompletedOrder(settlingOrder)}
                                            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                                            title="Preview and print 80mm dual slips"
                                        >
                                            <Printer className="h-3.5 w-3.5" />
                                            <span>Preview Slips</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettlingOrder(null)}
                                            className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSettling}
                                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-black text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 cursor-pointer"
                                        >
                                            {isSettling ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4" />
                                            )}
                                            <span>Complete Order</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* POS Bill Modal (Shown after completion or reprint) */}
                {completedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
                        <div className="relative my-auto flex w-full max-w-[480px] items-center justify-center">
                            <FullPageBill
                                order={completedOrder as any}
                                branding={activeBranding}
                                currency={currency}
                                initialTab="both"
                                onClose={() => setCompletedOrder(null)}
                            />
                        </div>
                    </div>
                )}

                {/* Active Tables & KOT Orders Drawer */}
                {showActiveOrders && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <ChefHat className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        All Active Kitchen & Dining Orders ({activeOrders.length})
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowActiveOrders(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {activeOrders.length === 0 ? (
                                    <p className="py-12 text-center text-xs text-slate-500">
                                        No active kitchen orders currently open.
                                    </p>
                                ) : (
                                    activeOrders.map((ao) => (
                                        <div
                                            key={ao.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold">{ao.order_number}</span>
                                                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                                                        {ao.table_number || ao.order_type.toUpperCase()}
                                                    </span>
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                                            ao.order_status === 'ready'
                                                                ? 'bg-emerald-500 text-white'
                                                                : ao.order_status === 'served'
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-amber-500 text-slate-950'
                                                        }`}
                                                    >
                                                        {ao.order_status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    {formatDateTime(ao.created_at)} • {ao.items?.length || 0} items ({ao.items?.map((i) => i.item_name).join(', ')})
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(ao.total_amount || 0, currency)}
                                                </span>

                                                {/* Cancel / Remove if processing */}
                                                {(ao.order_status === 'processing' || ao.order_status === 'ready') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOrder(ao.id, ao.order_number)}
                                                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                                        title="Cancel & Remove Order"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowActiveOrders(false);
                                                        openSettlementModal(ao);
                                                    }}
                                                    className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 cursor-pointer"
                                                >
                                                    <Printer className="h-3.5 w-3.5" /> Settle & Bill
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}