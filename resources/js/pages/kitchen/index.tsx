import React, { useEffect, useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
    Eye,
    EyeOff,
    Save,
    Loader2,
    Shield,
} from 'lucide-react';
import { showToast } from '@/lib/swal';

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

    // Profile Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showProfilePassword, setShowProfilePassword] = useState(false);

    // Profile form
    const profileForm = useForm({
        name: currentUser?.name || 'Kitchen Manager',
        kot_username: kotUsername || 'kitchen',
        email: currentUser?.email || 'kitchen@restaurant.com',
        phone: currentUser?.phone || '',
        password: '',
    });

    // List of order IDs currently undergoing smooth removal animation
    const [removingOrderIds, setRemovingOrderIds] = useState<number[]>([]);

    const prevOrderCountRef = useRef(initialOrders.length);
    const prevOrderIdsRef = useRef<number[]>(initialOrders.map((o) => o.id));

    // Update live clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/kitchen/profile', {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Kitchen staff details updated successfully!', 'success');
                setIsProfileModalOpen(false);
                profileForm.reset('password');
            },
            onError: () => {
                showToast('Failed to update kitchen staff details. Please check the fields.', 'error');
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
            <Head title="Kitchen Order Ticket (KOT) System" />

            {/* Top Navigation & Status Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Brand & KOT Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
                            <ChefHat className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black tracking-tight text-white sm:text-lg">
                                    {branding.brand_name || 'NOCTURNE'}
                                </h1>
                                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/30">
                                    KOT DISPLAY
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Kitchen Display System • {currentUser?.name || 'Kitchen Staff'}
                            </p>
                        </div>
                    </div>

                    {/* Live Clock, Profile, & Controls */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
                        {/* Live Clock */}
                        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
                            <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                            <span className="font-mono text-xs font-bold text-slate-200">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        {/* 30s Auto-Sync Badge */}
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700 text-slate-300">
                            <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
                            <span className="text-[11px] font-mono">Sync: {secondsToNextPoll}s</span>
                        </div>

                        {/* Audio Alert Toggle */}
                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`rounded-xl p-2 transition-all cursor-pointer ${
                                soundEnabled
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                            title={soundEnabled ? 'Chime sound alert ON' : 'Chime sound alert MUTED'}
                        >
                            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </button>

                        {/* Manual Refresh Button */}
                        <button
                            type="button"
                            onClick={() => fetchLatestOrders(true)}
                            className="rounded-xl bg-slate-800 p-2 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                            title="Refresh Now"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="hidden sm:block rounded-xl bg-slate-800 p-2 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>

                        {/* Edit Profile / Details Button */}
                        <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer shadow-sm"
                            title="Change Kitchen Employee & Login Details"
                        >
                            <UserCog className="h-3.5 w-3.5 text-amber-400" />
                            <span>My Details</span>
                        </button>

                        {/* Logout / Switch User */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-1 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Sub-Header: Filter Tabs & Stats */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                    {/* Status Tabs */}
                    <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setActiveTab('processing')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'processing'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                            <span>Kitchen Prep ({stats?.processing_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('ready')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'ready'
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Bell className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Ready to Serve ({stats?.ready_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('served')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'served'
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 font-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Utensils className="h-3.5 w-3.5 text-blue-400" />
                            <span>Served / Eating ({stats?.served_count ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-slate-700 text-white font-black'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <span>All Active ({stats?.total_active ?? 0})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('completed')}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                                activeTab === 'completed'
                                    ? 'bg-slate-700 text-white font-black'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Billed Today ({stats?.completed_today ?? 0})</span>
                        </button>
                    </div>

                    {/* Order Type Filter & Search */}
                    <div className="flex items-center gap-2">
                        <select
                            value={orderTypeFilter}
                            onChange={(e) => setOrderTypeFilter(e.target.value as any)}
                            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 focus:border-amber-500 focus:outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="dine_in">Dine-In Tables</option>
                            <option value="takeaway">Takeaway</option>
                            <option value="delivery">Delivery</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search ticket..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-36 sm:w-48 rounded-xl border border-slate-700 bg-slate-800 py-1.5 pr-2.5 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main KOT Ticket Display Grid */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {displayedOrders.length === 0 ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-600 mb-4 shadow-xl">
                            <ChefHat className="h-10 w-10 text-amber-500/40" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-300">All Kitchen Orders Clear!</h2>
                        <p className="mt-1 text-xs text-slate-500 max-w-sm">
                            No tickets waiting under <strong className="text-amber-400 capitalize">{activeTab}</strong>. New orders from POS will appear here automatically every 30s.
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
                                    className={`flex flex-col justify-between rounded-2xl border bg-slate-900 shadow-xl transition-all duration-500 overflow-hidden ${
                                        isRemoving
                                            ? 'opacity-0 scale-90 -translate-y-4 pointer-events-none'
                                            : 'opacity-100 scale-100'
                                    } ${
                                        isProcessing
                                            ? timer.isCritical
                                                ? 'border-rose-500/80 ring-2 ring-rose-500/40 shadow-rose-950/40'
                                                : timer.isWarning
                                                ? 'border-amber-500/80 ring-1 ring-amber-500/40 shadow-amber-950/40'
                                                : 'border-slate-700'
                                            : isReady
                                            ? 'border-emerald-500/70 bg-emerald-950/10 shadow-emerald-950/30'
                                            : 'border-blue-500/60 bg-blue-950/10'
                                    }`}
                                >
                                    {/* Ticket Header: Table/Type, Order Number & Live Stopwatch */}
                                    <div
                                        className={`p-3.5 border-b flex items-start justify-between gap-2 ${
                                            isProcessing
                                                ? timer.isCritical
                                                    ? 'bg-rose-500/15 border-rose-500/30'
                                                    : timer.isWarning
                                                    ? 'bg-amber-500/15 border-amber-500/30'
                                                    : 'bg-slate-800/70 border-slate-800'
                                                : isReady
                                                ? 'bg-emerald-500/15 border-emerald-500/30'
                                                : 'bg-blue-500/15 border-blue-500/30'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-black text-white tracking-tight">
                                                    {order.table_number || order.order_type.toUpperCase()}
                                                </span>
                                                <span className="rounded-md bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700 capitalize">
                                                    {order.order_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 font-mono text-[11px] text-slate-400 font-bold">
                                                #{order.order_number}
                                            </div>
                                        </div>

                                        {/* Elapsed Timer with Warning Cue */}
                                        <div
                                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-mono font-black shadow-sm ${
                                                timer.isCritical
                                                    ? 'bg-rose-500 text-white animate-pulse'
                                                    : timer.isWarning
                                                    ? 'bg-amber-500 text-slate-950 animate-bounce'
                                                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                                            }`}
                                        >
                                            <Clock className="h-3 w-3" />
                                            <span>{timer.formatted}</span>
                                        </div>
                                    </div>

                                    {/* Order Items List */}
                                    <div className="p-4 space-y-2.5 flex-1 divide-y divide-slate-800/60">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2.5">
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 font-mono text-xs font-black text-amber-400 border border-amber-500/30">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-100 leading-snug">
                                                        {item.item_name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Chef Special Notes */}
                                        {order.notes && (
                                            <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
                                                <span className="font-black uppercase tracking-wider block text-[9px] text-amber-400 mb-0.5">
                                                    Special Note:
                                                </span>
                                                {order.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Kitchen Action Footer with Right-Tick Mark Button */}
                                    <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-2">
                                        {isProcessing && (
                                            <button
                                                type="button"
                                                onClick={() => handleKitchenCompleteTick(order.id, order.order_number)}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
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
                                            <div className="w-full text-center py-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                                🍽️ Customer Eating / Waiting for Bill
                                            </div>
                                        )}

                                        {order.order_status === 'completed' && (
                                            <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
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

            {/* Kitchen Profile & Details Modification Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/40">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <UserCog className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Kitchen Profile & Login Details</h3>
                                    <p className="text-[11px] text-slate-400">Update your kitchen employee name, User ID, email, or password</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsProfileModalOpen(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
                            {/* Employee / Station Display Name */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-300">
                                    Kitchen Staff / Station Display Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        placeholder="e.g. Master Chef / Station 1"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pr-3 pl-10 text-xs font-bold text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                    />
                                </div>
                                {profileForm.errors.name && (
                                    <p className="mt-1 text-[10px] text-rose-400">{profileForm.errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Kitchen User ID */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-300">
                                        Kitchen User ID (Login) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.data.kot_username}
                                        onChange={(e) => profileForm.setData('kot_username', e.target.value)}
                                        placeholder="e.g. kitchen"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 font-mono text-xs font-bold text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                    />
                                    {profileForm.errors.kot_username && (
                                        <p className="mt-1 text-[10px] text-rose-400">{profileForm.errors.kot_username}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-300">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                        <input
                                            type="email"
                                            required
                                            value={profileForm.data.email}
                                            onChange={(e) => profileForm.setData('email', e.target.value)}
                                            placeholder="kitchen@restaurant.com"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pr-3 pl-9 text-xs font-semibold text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                        />
                                    </div>
                                    {profileForm.errors.email && (
                                        <p className="mt-1 text-[10px] text-rose-400">{profileForm.errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-300">
                                    Phone / Station Extension (Optional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="+8801700000000"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pr-3 pl-10 text-xs font-semibold text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-300">
                                    Change Password (Leave blank to keep unchanged)
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                    <input
                                        type={showProfilePassword ? 'text' : 'password'}
                                        value={profileForm.data.password}
                                        onChange={(e) => profileForm.setData('password', e.target.value)}
                                        placeholder="Enter new password (min. 4 characters)"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pr-10 pl-10 font-mono text-xs font-bold text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowProfilePassword(!showProfilePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                    >
                                        {showProfilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-amber-500" />}
                                    </button>
                                </div>
                                {profileForm.errors.password && (
                                    <p className="mt-1 text-[10px] text-rose-400">{profileForm.errors.password}</p>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                                >
                                    {profileForm.processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Saving Details...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Save Profile Details</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
