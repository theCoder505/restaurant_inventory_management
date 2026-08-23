import React, { useEffect, useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Utensils,
    Clock,
    CheckCircle2,
    ChefHat,
    Bell,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    RefreshCw,
    AlertCircle,
    Flame,
    Coffee,
    ArrowRight,
    Search,
    LogOut,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Check,
    RotateCcw,
    UserCog,
    X,
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    ShieldCheck,
    Sun,
    Moon,
    Monitor,
    Copy,
    CheckCheck,
    KeyRound,
    Info,
} from 'lucide-react';
import { showToast } from '@/lib/swal';
import { useAppearance } from '@/hooks/use-appearance';

interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    item_name: string;
    quantity: number;
    item_status?: 'processing' | 'ready' | 'served';
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
    notes?: string;
    created_at: string;
    items: OrderItem[];
    creator?: {
        name?: string;
    };
}

interface Props {
    activeOrders: Order[];
    completedToday: Order[];
    stats: {
        total_active: number;
        processing_count: number;
        ready_count: number;
        served_count: number;
        completed_today: number;
    };
    branding: {
        brand_name: string;
        brand_logo: string;
        brand_icon: string;
        default_currency: string;
    };
    currency: string;
    currentUser?: {
        name?: string;
        email?: string;
        phone?: string;
        role?: string;
    };
    kotUsername?: string;
}

export default function KitchenKOTIndex({
    activeOrders: initialOrders = [],
    completedToday = [],
    stats: initialStats,
    branding,
    currency = '৳',
    currentUser,
    kotUsername = 'kitchen',
}: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [stats, setStats] = useState(initialStats);
    const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'ready' | 'served' | 'completed'>('processing');
    const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');
    const [search, setSearch] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [secondsToNextPoll, setSecondsToNextPoll] = useState(30);

    // Read-only Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // List of order IDs currently undergoing smooth removal animation
    const [removingOrderIds, setRemovingOrderIds] = useState<number[]>([]);

    const prevOrderCountRef = useRef(initialOrders.length);
    const prevOrderIdsRef = useRef<number[]>(initialOrders.map((o) => o.id));

    // Update live clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Helper for clipboard copying
    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        try {
            navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            showToast(`Copied ${fieldName} to clipboard!`, 'success');
            setTimeout(() => setCopiedField(null), 2000);
        } catch (e) {
            showToast('Unable to copy to clipboard', 'info');
        }
    };

    // Toggle appearance between light and dark
    const handleToggleTheme = () => {
        const nextTheme = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(nextTheme);
        showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    };

    // Play chime sound on incoming new order
    const playChime = () => {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
            console.log('Audio playback error', e);
        }
    };

    // Auto-polling via POST request every 30 seconds for real-time kitchen updates
    const fetchLatestOrders = async (manual = false) => {
        if (manual) setIsRefreshing(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/kitchen/orders', {
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
                    const newOrders: Order[] = data.orders || [];
                    const newOrderIds = newOrders.map((o) => o.id);

                    // Check for newly added orders
                    const hasNewOrder = newOrders.some((o) => !prevOrderIdsRef.current.includes(o.id));
                    if (hasNewOrder && prevOrderIdsRef.current.length > 0) {
                        playChime();
                        showToast('New Kitchen Order Received!', 'info');
                    }

                    prevOrderCountRef.current = newOrders.length;
                    prevOrderIdsRef.current = newOrderIds;
                    setOrders(newOrders);
                    if (data.stats) setStats(data.stats);
                }
            }
        } catch (err) {
            console.error('KOT 30s polling error', err);
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

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    // Right-Tick Mark Action: Mark food as completed in kitchen and smoothly remove row
    const handleKitchenCompleteTick = async (orderId: number, orderNumber: string) => {
        // 1. Trigger smooth fade/slide out animation
        setRemovingOrderIds((prev) => [...prev, orderId]);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/kitchen/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ status: 'ready' }),
            });

            // Wait 400ms for CSS exit animation to complete smoothly
            setTimeout(() => {
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
                setRemovingOrderIds((prev) => prev.filter((id) => id !== orderId));
                showToast(`Order #${orderNumber} marked Ready!`, 'success');
            }, 450);

            if (res.ok) {
                // Background refresh stats
                fetchLatestOrders(false);
            }
        } catch (e) {
            setRemovingOrderIds((prev) => prev.filter((id) => id !== orderId));
            showToast('Failed to update kitchen status', 'error');
        }
    };

    // Transition directly to served
    const handleMarkServed = async (orderId: number, orderNumber: string) => {
        setRemovingOrderIds((prev) => [...prev, orderId]);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            await fetch(`/kitchen/orders/${orderId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({ status: 'served' }),
            });

            setTimeout(() => {
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
                setRemovingOrderIds((prev) => prev.filter((id) => id !== orderId));
                showToast(`Order #${orderNumber} marked Delivered to Table!`, 'success');
            }, 450);

            fetchLatestOrders(false);
        } catch (e) {
            setRemovingOrderIds((prev) => prev.filter((id) => id !== orderId));
            showToast('Failed to update status', 'error');
        }
    };

    // Calculate elapsed time in minutes & seconds
    const getElapsedTime = (createdDateStr: string) => {
        const created = new Date(createdDateStr).getTime();
        const now = currentTime.getTime();
        const diffMs = Math.max(0, now - created);
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        return {
            mins,
            secs,
            formatted: `${mins}m ${secs < 10 ? '0' : ''}${secs}s`,
            isWarning: mins >= 10 && mins < 20,
            isCritical: mins >= 20,
        };
    };

    // Filter displayed orders
    const displayedOrders = (activeTab === 'completed' ? completedToday : orders).filter((order) => {
        const matchesTab =
            activeTab === 'all'
                ? ['processing', 'ready', 'served'].includes(order.order_status)
                : order.order_status === activeTab;

        const matchesType = orderTypeFilter === 'all' || order.order_type === orderTypeFilter;

        const searchLower = search.toLowerCase();
        const matchesSearch =
            !search ||
            order.order_number.toLowerCase().includes(searchLower) ||
            (order.table_number && order.table_number.toLowerCase().includes(searchLower)) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
            order.items?.some((item) => (item.item_name || '').toLowerCase().includes(searchLower));

        return matchesTab && matchesType && matchesSearch;
    });

    const handleLogout = () => {
        router.post('/kitchen/logout');
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
            <Head title="Kitchen Order Ticket (KOT) System" />

            {/* Top Navigation & Status Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 sm:px-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Brand & KOT Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                            <ChefHat className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
                                    {branding.brand_name || 'NOCTURNE'}
                                </h1>
                                <span className="rounded-md bg-amber-500/15 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                    KOT DISPLAY
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Kitchen Display System • {currentUser?.name || 'Kitchen Staff'}
                            </p>
                        </div>
                    </div>

                    {/* Live Clock, Theme Toggle, Details, & Controls */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
                        {/* Live Clock */}
                        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200 dark:border-slate-700">
                            <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        {/* 30s Auto-Sync Badge */}
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            <RefreshCw className={`h-3.5 w-3.5 text-amber-500 dark:text-amber-400 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                            <span className="text-[11px] font-mono font-semibold">Sync: {secondsToNextPoll}s</span>
                        </div>

                        {/* Theme Toggle (Dark / Light Mode) */}
                        <button
                            type="button"
                            onClick={handleToggleTheme}
                            className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                            title={`Current mode: ${appearance}. Click to switch to ${appearance === 'dark' ? 'Light' : 'Dark'} Mode`}
                        >
                            {appearance === 'dark' ? (
                                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
                            ) : (
                                <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
                            )}
                            <span className="hidden lg:inline text-[11px] font-bold capitalize">{appearance === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>

                        {/* Audio Alert Toggle */}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`rounded-xl p-2 transition-all cursor-pointer ${
                                soundEnabled
                                    ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                            title={soundEnabled ? 'Chime sound alert ON' : 'Chime sound alert MUTED'}
                        >
                            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </button>

                        {/* Manual Refresh Button */}
                        <button
                            type="button"
                            onClick={() => fetchLatestOrders(true)}
                            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            title="Refresh Now"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-amber-500 dark:text-amber-400' : ''}`} />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="hidden sm:block rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>

                        {/* View Station / Login Details (Read-Only) */}
                        <button
                            type="button"
                            onClick={() => setIsDetailsModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
                            title="View Kitchen Station & Login Information (Read-Only)"
                        >
                            <UserCog className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>My Details</span>
                        </button>

                        {/* Logout / Switch User */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Sub-Header: Filter Tabs & Stats */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                    {/* Status Tabs */}
                    <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('processing')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'processing'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Kitchen Prep ({stats?.processing_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('ready')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'ready'
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Bell className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Ready to Serve ({stats?.ready_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('served')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'served'
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Utensils className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Served / Eating ({stats?.served_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-slate-800 dark:bg-slate-700 text-white font-black'
                                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span>All Active ({stats?.total_active ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('completed')}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'completed'
                                    ? 'bg-slate-800 dark:bg-slate-700 text-white font-black'
                                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Billed Today ({stats?.completed_today ?? 0})</span>
                        </button>
                    </div>

                    {/* Order Type Filter & Search */}
                    <div className="flex items-center gap-2">
                        <select
                            value={orderTypeFilter}
                            onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-amber-500 focus:outline-none shadow-xs"
                        >
                            <option value="all">All Types</option>
                            <option value="dine_in">Dine-In Tables</option>
                            <option value="takeaway">Takeaway</option>
                            <option value="delivery">Delivery</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search ticket..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-36 sm:w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pr-2.5 pl-8 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 focus:outline-none shadow-xs"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main KOT Ticket Display Grid */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {displayedOrders.length === 0 ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 mb-4 shadow-xl">
                            <ChefHat className="h-10 w-10 text-amber-500/60 dark:text-amber-500/40" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-300">All Kitchen Orders Clear!</h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 max-w-sm">
                            No tickets waiting under <strong className="text-amber-600 dark:text-amber-400 capitalize">{activeTab}</strong>. New orders from POS will appear here automatically every 30s.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 items-start">
                        {displayedOrders.map((order) => {
                            const timer = getElapsedTime(order.created_at);
                            const isProcessing = order.order_status === 'processing';
                            const isReady = order.order_status === 'ready';
                            const isServed = order.order_status === 'served';
                            const isRemoving = removingOrderIds.includes(order.id);

                            return (
                                <div
                                    key={order.id}
                                    className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 shadow-md dark:shadow-xl transition-all duration-500 overflow-hidden ${
                                        isRemoving
                                            ? 'opacity-0 scale-90 -translate-y-4 pointer-events-none'
                                            : 'opacity-100 scale-100'
                                    } ${
                                        isProcessing
                                            ? timer.isCritical
                                                ? 'border-rose-400 dark:border-rose-500/80 ring-2 ring-rose-400/40 dark:ring-rose-500/40 shadow-rose-100 dark:shadow-rose-950/40'
                                                : timer.isWarning
                                                ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/40 dark:ring-amber-500/40 shadow-amber-100 dark:shadow-amber-950/40'
                                                : 'border-slate-200 dark:border-slate-700/80'
                                            : isReady
                                            ? 'border-emerald-300 dark:border-emerald-500/70 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-emerald-50 dark:shadow-emerald-950/30'
                                            : 'border-blue-300 dark:border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/10'
                                    }`}
                                >
                                    {/* Ticket Header: Table/Type, Order Number & Live Stopwatch */}
                                    <div
                                        className={`p-3.5 border-b flex items-start justify-between gap-2 ${
                                            isProcessing
                                                ? timer.isCritical
                                                    ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30'
                                                    : timer.isWarning
                                                    ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30'
                                                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-800'
                                                : isReady
                                                ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30'
                                                : 'bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                                    {order.table_number || order.order_type.toUpperCase()}
                                                </span>
                                                <span className="rounded-md bg-white dark:bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize shadow-xs">
                                                    {order.order_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                                #{order.order_number}
                                            </div>
                                        </div>

                                        {/* Elapsed Timer with Warning Cue */}
                                        <div
                                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono font-black shadow-xs ${
                                                timer.isCritical
                                                    ? 'bg-rose-500 text-white animate-pulse'
                                                    : timer.isWarning
                                                    ? 'bg-amber-500 text-slate-950 animate-bounce'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <Clock className="h-3 w-3" />
                                            <span>{timer.formatted}</span>
                                        </div>
                                    </div>

                                    {/* Order Items List */}
                                    <div className="p-4 space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-500/20 font-mono text-xs font-black text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                                        {item.item_name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Chef Special Notes */}
                                        {order.notes && (
                                            <div className="mt-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-300">
                                                <span className="font-black uppercase tracking-wider block text-[9px] text-amber-700 dark:text-amber-400 mb-0.5">
                                                    Special Note:
                                                </span>
                                                {order.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Kitchen Action Footer with Right-Tick Mark Button */}
                                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2">
                                        {isProcessing && (
                                            <button
                                                type="button"
                                                onClick={() => handleKitchenCompleteTick(order.id, order.order_number)}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
                                                title="Mark Food Complete & Ready to Serve"
                                            >
                                                <Check className="h-5 w-5 stroke-[3]" />
                                                <span>Mark Ready (Done Prep)</span>
                                            </button>
                                        )}

                                        {isReady && (
                                            <div className="w-full flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkServed(order.id, order.order_number)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 py-2.5 text-xs font-black text-white shadow-md hover:bg-blue-400 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    <Utensils className="h-4 w-4" />
                                                    <span>Delivered to Table</span>
                                                </button>
                                            </div>
                                        )}

                                        {isServed && (
                                            <div className="w-full text-center py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                                                🍽️ Customer Eating / Waiting for Bill
                                            </div>
                                        )}

                                        {order.order_status === 'completed' && (
                                            <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                                ✓ Billed & Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Read-Only Kitchen Station & Credentials Details Modal */}
            {isDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kitchen Station & Access Details</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Read-only kitchen account & station identification</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body / Information Tiles */}
                        <div className="p-6 space-y-4">
                            {/* Security Notice: Read-Only Info */}
                            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-300">
                                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <div className="font-black uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
                                        Admin-Managed Credentials
                                    </div>
                                    <p className="text-[11px] leading-relaxed">
                                        Kitchen login credentials are strictly read-only for station operators. To change login passwords, user IDs, or email assignments, please contact the restaurant administrator.
                                    </p>
                                </div>
                            </div>

                            {/* Credentials & Station Information Grid */}
                            <div className="space-y-3">
                                {/* Station / Staff Display Name */}
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                                Staff / Station Name
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {currentUser?.name || 'Kitchen Staff'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="rounded-lg bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                        Active
                                    </span>
                                </div>

                                {/* Kitchen User ID (Login) */}
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                            <KeyRound className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                                Kitchen Login ID (Username)
                                            </span>
                                            <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                                                {kotUsername || 'kitchen'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(kotUsername || 'kitchen', 'User ID')}
                                        className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
                                        title="Copy Login User ID"
                                    >
                                        {copiedField === 'User ID' ? (
                                            <>
                                                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-emerald-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Email Address */}
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                                Station Email
                                            </span>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                {currentUser?.email || 'kitchen@restaurant.com'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(currentUser?.email || 'kitchen@restaurant.com', 'Email')}
                                        className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
                                        title="Copy Email Address"
                                    >
                                        {copiedField === 'Email' ? (
                                            <>
                                                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="text-emerald-500">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Station Role & Phone Extension */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Role */}
                                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="h-3.5 w-3.5 text-amber-500" />
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                Assigned Role
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                                            {currentUser?.role || 'Kitchen Staff'}
                                        </span>
                                    </div>

                                    {/* Phone / Extension */}
                                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                Extension
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            {currentUser?.phone || 'Not configured'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Close Button */}
                            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
