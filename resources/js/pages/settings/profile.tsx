import { useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/swal';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Monitor,
    Moon,
    Phone,
    Save,
    Shield,
    ShieldCheck,
    Sun,
    User,
} from 'lucide-react';
import React, { FormEventHandler, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Admin Profile Settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail?: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Profile Info Form
    const profileForm = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: (auth.user as any).phone || '',
    });

    // Password Update Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Admin profile details updated successfully!', 'success');
            },
            onError: () => {
                showToast('Please check the form for errors.', 'error');
            },
        });
    };

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Admin password changed successfully!', 'success');
                passwordForm.reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordInput.current?.focus();
                }
                showToast('Could not update password. Check errors below.', 'error');
            },
        });
    };

    const handleThemeSelect = (mode: 'light' | 'dark' | 'system') => {
        updateAppearance(mode);
        showToast(`Theme updated to ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`, 'info');
    };

    const initials = (auth.user.name || 'Admin')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Profile & Account Settings" />

            <div className="min-h-[calc(100vh-73px)] space-y-6 bg-slate-50/50 p-4 md:p-8 dark:bg-slate-950 dark:text-slate-100">
                {/* Header Profile Identity Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="absolute right-0 top-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-amber-600 font-black text-white shadow-lg shadow-amber-500/20 text-xl">
                                {initials}
                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900">
                                    <ShieldCheck className="h-3 w-3" />
                                </span>
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {auth.user.name}
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        <Shield className="h-3 w-3" /> System Administrator
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {auth.user.email} • Full Operational & Inventory Control Access
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0 dark:border-slate-800">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2 text-center dark:border-slate-800 dark:bg-slate-950/60">
                                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Role Status</span>
                                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active & Secure
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Section 1: Profile Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Profile Information</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Update your personal account credentials and details</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        required
                                        placeholder="Administrator name"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                </div>
                                {profileForm.errors.name && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{profileForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        required
                                        placeholder="admin@restaurant.com"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                </div>
                                {profileForm.errors.email && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{profileForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Contact Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={profileForm.data.phone}
                                        onChange={(e) => profileForm.setData('phone', e.target.value)}
                                        placeholder="+8801712345678"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                </div>
                                {profileForm.errors.phone && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{profileForm.errors.phone}</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    {profileForm.processing ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Section 2: Security & Password */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Security & Password</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your administrator account uses a strong credentials password</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Current Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        ref={currentPasswordInput}
                                        type={showCurrentPass ? 'text' : 'password'}
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.current_password && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    New Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        ref={passwordInput}
                                        type={showNewPass ? 'text' : 'password'}
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        required
                                        placeholder="Min. 8 characters"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.password && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Confirm New Password <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type={showConfirmPass ? 'text' : 'password'}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        required
                                        placeholder="Repeat new password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordForm.errors.password_confirmation && (
                                    <p className="mt-1 text-[11px] font-medium text-rose-500">{passwordForm.errors.password_confirmation}</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-600 cursor-pointer"
                                >
                                    <Lock className="h-4 w-4" />
                                    {passwordForm.processing ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Section 3: Interface & Theme Preference */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <Monitor className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Interface & Appearance Preference</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Choose the color theme mode for your administrator dashboard</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Light Mode Option */}
                        <div
                            onClick={() => handleThemeSelect('light')}
                            className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all ${
                                appearance === 'light'
                                    ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                            }`}
                        >
                            {appearance === 'light' && (
                                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                            )}
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-amber-500 shadow-sm dark:bg-slate-900">
                                <Sun className="h-6 w-6" />
                            </div>
                            <div className="mt-4">
                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Light Mode</div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Crisp, clean high-contrast daylight aesthetic
                                </p>
                            </div>
                        </div>

                        {/* Dark Mode Option */}
                        <div
                            onClick={() => handleThemeSelect('dark')}
                            className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all ${
                                appearance === 'dark'
                                    ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                            }`}
                        >
                            {appearance === 'dark' && (
                                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                            )}
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-sm border border-slate-800">
                                <Moon className="h-6 w-6" />
                            </div>
                            <div className="mt-4">
                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Dark Slate Mode</div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Deep nocturnal slate theme matching the restaurant atmosphere
                                </p>
                            </div>
                        </div>

                        {/* System Mode Option */}
                        <div
                            onClick={() => handleThemeSelect('system')}
                            className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition-all ${
                                appearance === 'system'
                                    ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20'
                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950'
                            }`}
                        >
                            {appearance === 'system' && (
                                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                                    <Check className="h-3.5 w-3.5" />
                                </span>
                            )}
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div className="mt-4">
                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">System Sync</div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Automatically match your device and operating system preference
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

