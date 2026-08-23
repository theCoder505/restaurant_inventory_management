import { Head, Link, useForm } from '@inertiajs/react';
import { ChefHat, Clock, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck, Sparkles, User, UtensilsCrossed } from 'lucide-react';
import React, { FormEventHandler, useEffect, useState } from 'react';

interface Branding {
    brand_name: string;
    brand_logo?: string;
    brand_logo_dark?: string;
    brand_icon?: string;
    tagline?: string;
}

type KitchenLoginForm = {
    login: string;
    password: string;
    remember: boolean;
};

interface Props {
    branding: Branding;
    status?: string;
    defaultUsername?: string;
}

export default function KitchenLogin({ branding, status, defaultUsername }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm<KitchenLoginForm>({
        login: defaultUsername || 'kitchen',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/kitchen/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
            <Head title="Kitchen Portal Login | KOT Terminal" />

            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
            <div className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[140px]" />
            <div className="pointer-events-none absolute top-1/3 -left-20 h-[300px] w-[300px] rounded-full bg-amber-600/5 blur-[120px]" />

            {/* Top Navigation Bar */}
            <header className="relative z-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-3.5 backdrop-blur-md sm:px-8">
                <div className="flex items-center gap-3">
                    {branding.brand_icon ? (
                        <img
                            src={branding.brand_icon}
                            alt={branding.brand_name}
                            className="h-9 w-9 rounded-xl object-contain ring-1 ring-amber-500/30 p-0.5 bg-slate-900"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black">
                            <ChefHat className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black tracking-wider text-white uppercase">
                                {branding.brand_name || 'NOCTURNE'}
                            </span>
                            <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-amber-400">
                                KOT Portal
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Kitchen Display System & Station Terminal</p>
                    </div>
                </div>

                {/* Live Clock Header */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 font-mono text-xs text-slate-300 shadow-inner">
                    <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    <span>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-bold text-amber-400">
                        {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                    </span>
                </div>
            </header>

            {/* Main Login Card Area */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
                <div className="w-full max-w-md">
                    {/* Brand Card Wrapper */}
                    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-700">
                        {/* Header Badge */}
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10 ring-4 ring-amber-500/5">
                                <UtensilsCrossed className="h-7 w-7" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Kitchen Station Login
                            </h1>
                            <p className="mt-1 text-xs text-slate-400">
                                Enter your Kitchen User ID / Email & Password to access live orders.
                            </p>
                        </div>

                        {/* Flash message if any */}
                        {status && (
                            <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs font-bold text-emerald-400">
                                {status}
                            </div>
                        )}

                        {/* Top-level validation error */}
                        {errors.login && (
                            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-400">
                                <p className="font-bold">Authentication failed:</p>
                                <p className="mt-0.5 text-[11px] text-rose-300">{errors.login}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* User ID / Email Input */}
                            <div>
                                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Kitchen User ID / Email</span>
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-normal">e.g. kitchen</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        placeholder="kitchen or kitchen@restaurant.com"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 font-mono text-xs font-bold text-white shadow-inner transition-all placeholder:text-slate-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <Lock className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Kitchen Password</span>
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 pr-11 font-mono text-xs font-bold text-white shadow-inner transition-all placeholder:text-slate-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-white cursor-pointer"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-amber-500" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-400">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Checkbox */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 accent-amber-500 focus:ring-0 cursor-pointer"
                                    />
                                    <span>Keep Station Logged In</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Authenticating Station...</span>
                                    </>
                                ) : (
                                    <>
                                        <ChefHat className="h-4 w-4" />
                                        <span>Enter Kitchen Display</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Admin Config Hint Box */}
                        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-[11px] text-slate-400">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                                <div>
                                    <span className="font-bold text-slate-300">Admin-Managed Credentials:</span>
                                    <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed">
                                        Kitchen User ID & Password can be configured by the restaurant administrator in the{' '}
                                        <span className="text-amber-400 font-semibold">App Settings</span> panel.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Switch Portals Links */}
                        <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                            <Link
                                href="/"
                                className="transition-colors hover:text-amber-400"
                            >
                                &larr; Restaurant Front
                            </Link>
                            <Link
                                href="/administration-control/login"
                                className="transition-colors hover:text-amber-400 font-semibold"
                            >
                                Admin Login &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-center text-[10px] text-slate-600">
                <span>{branding.brand_name || 'NOCTURNE'} • Kitchen Order Display System (KOT)</span>
            </footer>
        </div>
    );
}
