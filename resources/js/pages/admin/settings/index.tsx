import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Check, ChefHat, Clock, Copy, Download, ExternalLink, Eye, EyeOff, Globe, Image as ImageIcon, Key, Loader2, MessageCircle, Moon, Save, Settings, Sparkles, Sun, Upload } from 'lucide-react';
import { useState } from 'react';

interface SettingsData {
    brand_name: string;
    brand_logo?: string;
    brand_logo_dark?: string;
    brand_icon?: string;
    header_white_logo?: string;
    tagline: string;
    about_text: string;
    phone: string;
    whatsapp_number?: string;
    enable_whatsapp?: string;
    email: string;
    notification_email: string;
    address: string;
    opening_hours: string;
    logo_url?: string;
    default_currency: string;
    week_start_day?: string;
    tax_percentage: string;
    expiry_warning_threshold: string;
    google_maps_embed: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    terms_conditions: string;
    privacy_policy: string;
    footer_text: string;
    hero_bg_image?: string;
    atmosphere_image?: string;
    vip_lounge_image?: string;
    kot_name?: string;
    kot_username?: string;
    kot_email?: string;
    kot_password?: string;
}

interface Props {
    settings: SettingsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'App Branding & Settings', href: '/administration-control/settings' },
];

export default function SettingsIndex({ settings }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.brand_logo || null);
    const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(settings.brand_logo_dark || settings.brand_logo || null);
    const [iconPreview, setIconPreview] = useState<string | null>(settings.brand_icon || null);
    const [heroBgPreview, setHeroBgPreview] = useState<string | null>(settings.hero_bg_image || null);
    const [atmospherePreview, setAtmospherePreview] = useState<string | null>(settings.atmosphere_image || null);
    const [vipLoungePreview, setVipLoungePreview] = useState<string | null>(settings.vip_lounge_image || null);
    const [showKotPassword, setShowKotPassword] = useState(false);
    const [copiedKotUrl, setCopiedKotUrl] = useState(false);

    const form = useForm({
        brand_name: settings.brand_name || 'NOCTURNE',
        brand_logo: settings.brand_logo || '/uploads/branding/logo.svg',
        brand_logo_dark: settings.brand_logo_dark || settings.brand_logo || '/uploads/branding/logo.svg',
        brand_icon: settings.brand_icon || '/uploads/branding/icon.svg',
        header_white_logo: settings.header_white_logo ?? '1',
        brand_logo_file: null as File | null,
        brand_logo_dark_file: null as File | null,
        brand_icon_file: null as File | null,
        hero_bg_file: null as File | null,
        atmosphere_image_file: null as File | null,
        vip_lounge_image_file: null as File | null,
        tagline: settings.tagline || 'CRAVINGS NEVER SLEEP',
        about_text: settings.about_text || '',
        phone: settings.phone || '+8801700000000',
        whatsapp_number: settings.whatsapp_number || settings.phone || '+8801700000000',
        enable_whatsapp: settings.enable_whatsapp ?? '1',
        email: settings.email || 'contact@restaurant.com',
        notification_email: settings.notification_email || 'admin@restaurant.com',
        address: settings.address || '889 Midnight Ave, Suite B, Downtown District',
        opening_hours: settings.opening_hours || "Saturday - Wednesday: 8:00 PM - 4:00 AM\nThursday - Friday (Peak Nights): 8:00 PM - 6:00 AM",
        logo_url: settings.logo_url || '',
        default_currency: settings.default_currency || '৳',
        week_start_day: settings.week_start_day || 'saturday',
        tax_percentage: settings.tax_percentage || '5.0',
        expiry_warning_threshold: settings.expiry_warning_threshold || '80',
        google_maps_embed: settings.google_maps_embed || '',
        social_facebook: settings.social_facebook || '#',
        social_instagram: settings.social_instagram || '#',
        social_twitter: settings.social_twitter || '#',
        terms_conditions: settings.terms_conditions || '',
        privacy_policy: settings.privacy_policy || '',
        footer_text: settings.footer_text || '',
        kot_name: settings.kot_name || 'Kitchen Manager',
        kot_username: settings.kot_username || 'kitchen',
        kot_email: settings.kot_email || 'kitchen@restaurant.com',
        kot_password: settings.kot_password || 'kitchen123',
    });

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('brand_logo_file', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleDarkLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('brand_logo_dark_file', file);
            setDarkLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('brand_icon_file', file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleHeroBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('hero_bg_file', file);
            setHeroBgPreview(URL.createObjectURL(file));
        }
    };

    const handleAtmosphereChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('atmosphere_image_file', file);
            setAtmospherePreview(URL.createObjectURL(file));
        }
    };

    const handleVipLoungeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('vip_lounge_image_file', file);
            setVipLoungePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/administration-control/settings', {
            forceFormData: true,
            onSuccess: () => showToast('App settings, logos & configurations saved successfully!', 'success'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Branding & Settings" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Settings className="h-6 w-6 text-amber-500" /> App Branding, Calendar & Configuration
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Configure light and dark branding logos, background photography, operating hours, week start day, and financial rules.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/administration-control/settings/backup"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Download className="h-4 w-4 text-amber-500" /> Download DB Backup
                        </a>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {form.processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                    {/* Visual Brand Assets & Logos (Light & Dark) */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <ImageIcon className="h-4 w-4 text-amber-500" /> Brand Identity & Logo Uploads (Light & Dark Theme)
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Upload separate logos tailored for light backgrounds and dark nightlife backgrounds.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* 1. Light Theme Logo Upload Card */}
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 dark:border-amber-500/20 flex flex-col justify-between">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        <Sun className="h-4 w-4 text-amber-500" /> Light Theme Logo
                                    </label>
                                    <p className="mb-3 text-[11px] text-slate-500">
                                        Active in Light Mode, printed POS receipts, and light headers.
                                    </p>

                                    <div className="mb-4 flex items-center justify-center h-20 w-full rounded-xl border border-slate-300 bg-white p-2 shadow-inner dark:border-slate-700">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Light Logo Preview" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-slate-400">No Light Logo</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="inline-flex cursor-pointer items-center justify-center w-full gap-1.5 rounded-xl bg-white px-3.5 py-2 font-bold text-slate-800 border border-slate-300 shadow-sm transition-all hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700">
                                        <Upload className="h-3.5 w-3.5 text-amber-500" /> Upload Light Logo
                                        <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                                    </label>
                                    <p className="text-[10px] text-slate-400 text-center">PNG, SVG, JPG, WEBP (Max 5MB)</p>
                                </div>
                            </div>

                            {/* 2. Dark Theme Logo Upload Card */}
                            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 dark:border-indigo-500/20 flex flex-col justify-between">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        <Moon className="h-4 w-4 text-indigo-400" /> Dark Theme Logo
                                    </label>
                                    <p className="mb-3 text-[11px] text-slate-500">
                                        Active in Dark Mode, dark navigation bars, and nightlife hero sections.
                                    </p>

                                    <div className="mb-4 flex items-center justify-center h-20 w-full rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-inner">
                                        {darkLogoPreview ? (
                                            <img src={darkLogoPreview} alt="Dark Logo Preview" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-slate-500">No Dark Logo</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="inline-flex cursor-pointer items-center justify-center w-full gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 font-bold text-white border border-slate-700 shadow-sm transition-all hover:bg-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700">
                                        <Upload className="h-3.5 w-3.5 text-indigo-400" /> Upload Dark Logo
                                        <input type="file" accept="image/*" onChange={handleDarkLogoFileChange} className="hidden" />
                                    </label>
                                    <p className="text-[10px] text-slate-400 text-center">PNG, SVG, JPG, WEBP (Max 5MB)</p>
                                </div>
                            </div>

                            {/* 3. Favicon / Icon Card with Preview */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        <ImageIcon className="h-4 w-4 text-amber-500" /> App Favicon / Square Icon
                                    </label>
                                    <p className="mb-3 text-[11px] text-slate-500">Browser tab icon, sidebar brandmark, and mobile shortcut.</p>

                                    <div className="mb-4 flex items-center justify-center h-20 w-full rounded-xl border border-slate-300 bg-slate-900 p-2 shadow-inner dark:border-slate-800">
                                        {iconPreview ? (
                                            <img src={iconPreview} alt="Icon Preview" className="max-h-12 max-w-12 object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-slate-400">No Icon</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="inline-flex cursor-pointer items-center justify-center w-full gap-1.5 rounded-xl bg-slate-200 px-3.5 py-2 font-bold text-slate-800 transition-all hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                                        <Upload className="h-3.5 w-3.5" /> Upload Icon File
                                        <input type="file" accept="image/*" onChange={handleIconFileChange} className="hidden" />
                                    </label>
                                    <p className="text-[10px] text-slate-400 text-center">Square SVG, PNG or ICO (Max 2MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Header White Logo Color Setting */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs">
                                        <Sparkles className="h-4 w-4 text-amber-500" /> Header White Logo Color (When Unscrolled)
                                    </label>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                                        If marked, the surface header logo will be displayed in white (inverted filter) when the page is not scrolled over the hero banner. When unmarked, it displays in its theme-appropriate logo colors (e.g. Dark Theme Logo).
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <label className="inline-flex items-center cursor-pointer gap-2.5 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm transition-all hover:border-amber-400">
                                        <input
                                            type="checkbox"
                                            checked={form.data.header_white_logo === '1' || form.data.header_white_logo === 'true'}
                                            onChange={(e) => form.setData('header_white_logo', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-amber-400 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <span className={`text-xs font-bold ${
                                            form.data.header_white_logo === '1' || form.data.header_white_logo === 'true'
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {form.data.header_white_logo === '1' || form.data.header_white_logo === 'true' ? 'White Color (Marked)' : 'Original Colors (Unmarked)'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Live Visual Demonstration Preview */}
                            <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-6 text-[11px]">
                                <span className="font-semibold text-slate-500 dark:text-slate-400">Preview on Surface Unscrolled Header:</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 items-center justify-center rounded-lg bg-black/80 px-4 border border-white/20 shadow-sm">
                                        {darkLogoPreview || logoPreview ? (
                                            <img
                                                src={darkLogoPreview || logoPreview || ''}
                                                alt="Logo Mode Preview"
                                                className={`h-6 w-auto object-contain transition-all duration-300 ${
                                                    form.data.header_white_logo === '1' || form.data.header_white_logo === 'true'
                                                        ? 'brightness-0 invert drop-shadow-[0_1px_4px_rgba(255,255,255,0.4)]'
                                                        : ''
                                                }`}
                                            />
                                        ) : (
                                            <span className="text-[10px] text-white">No Logo</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                        {form.data.header_white_logo === '1' || form.data.header_white_logo === 'true'
                                            ? '✨ Inverted Pure White (High contrast over dark photo background)'
                                            : '🎨 Dark Theme Logo (Original colors over hero background)'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Surface Website Background Photography */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <Sparkles className="h-4 w-4 text-orange-500" /> Surface Website Background Images (Live Preview & Upload)
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Customize the 3 high-impact background images on the public surface. Upload custom photos or revert anytime.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* 1. Hero Background */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                                <div>
                                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        1. Hero Section Main Background
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">Top banner background photography</p>

                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner dark:border-slate-800 mb-3">
                                        {heroBgPreview ? (
                                            <img src={heroBgPreview} alt="Hero Background Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                                Default Burger Photo
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                            {form.data.hero_bg_file ? 'New Selected' : 'Current Active'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleHeroBgChange}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-orange-600"
                                    />
                                    <p className="text-[10px] text-slate-400">High-res landscape 1920x1080px (Max 10MB)</p>
                                </div>
                            </div>

                            {/* 2. Atmosphere / Lounge Image */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                                <div>
                                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        2. After-Hours Atmosphere Image
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">Backdrop card in the "After-Hours Atmosphere" section</p>

                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner dark:border-slate-800 mb-3">
                                        {atmospherePreview ? (
                                            <img src={atmospherePreview} alt="Atmosphere Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                                Default Lounge Photo
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                            {form.data.atmosphere_image_file ? 'New Selected' : 'Current Active'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAtmosphereChange}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-orange-600"
                                    />
                                    <p className="text-[10px] text-slate-400">High-res 1200x800px (Max 10MB)</p>
                                </div>
                            </div>

                            {/* 3. VIP Lounge / Elite Syndicate */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                                <div>
                                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        3. Elite Syndicate VIP Lounge Image
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">Full-bleed luxury backdrop for "The Elite Syndicate" section</p>

                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner dark:border-slate-800 mb-3">
                                        {vipLoungePreview ? (
                                            <img src={vipLoungePreview} alt="VIP Lounge Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                                Default VIP Photo
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                            {form.data.vip_lounge_image_file ? 'New Selected' : 'Current Active'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleVipLoungeChange}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-orange-600"
                                    />
                                    <p className="text-[10px] text-slate-400">High-res 1920x1080px (Max 10MB)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Branding & WhatsApp Integration */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                            <Globe className="h-4 w-4 text-amber-500" /> Restaurant Branding, Contact & WhatsApp Integration
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Restaurant Brand Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.brand_name}
                                    onChange={(e) => form.setData('brand_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Tagline / Slogan</label>
                                <input
                                    type="text"
                                    value={form.data.tagline}
                                    onChange={(e) => form.setData('tagline', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        {/* WhatsApp Integration & Enable/Disable Toggle */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 dark:border-emerald-500/20 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
                                        <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> WhatsApp Integration Status
                                    </label>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        Control whether WhatsApp ordering links & the bottom-right floating WhatsApp button are active on the website.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="inline-flex items-center cursor-pointer gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/50 shadow-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.data.enable_whatsapp === '1' || form.data.enable_whatsapp === 'true'}
                                            onChange={(e) => form.setData('enable_whatsapp', e.target.checked ? '1' : '0')}
                                            className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className={`text-xs font-bold ${
                                            form.data.enable_whatsapp === '1' || form.data.enable_whatsapp === 'true'
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {form.data.enable_whatsapp === '1' || form.data.enable_whatsapp === 'true' ? 'Enabled (Active)' : 'Disabled (Hidden)'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center pt-1">
                                <div>
                                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                        Dedicated WhatsApp Order Number (Country Code + Number) *
                                    </label>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        When enabled, all surface WhatsApp CTA buttons, recipe ordering, and floating WhatsApp buttons connect to this number.
                                    </p>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        required={form.data.enable_whatsapp === '1' || form.data.enable_whatsapp === 'true'}
                                        placeholder="e.g. +8801700000000 or 8801700000000"
                                        value={form.data.whatsapp_number}
                                        onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                        className={`w-full rounded-xl border px-3.5 py-2.5 font-mono text-sm font-bold shadow-sm transition-all ${
                                            form.data.enable_whatsapp === '1' || form.data.enable_whatsapp === 'true'
                                                ? 'border-emerald-400 bg-white text-emerald-900 focus:border-emerald-600 dark:border-emerald-500/40 dark:bg-slate-950 dark:text-emerald-300'
                                                : 'border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">General Phone (Voice Calls) *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Contact Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Admin Notification Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={form.data.notification_email}
                                    onChange={(e) => form.setData('notification_email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Restaurant Address</label>
                                <textarea
                                    rows={3}
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            {/* Dynamic Operating Hours Textarea */}
                            <div>
                                <label className="mb-1 flex items-center justify-between font-medium text-slate-600 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                        <Clock className="h-3.5 w-3.5 text-amber-500" /> Dynamic Operating Hours (Line by Line)
                                    </span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Saturday - Wednesday: 8:00 PM - 4:00 AM&#10;Thursday - Friday (Peak Nights): 8:00 PM - 6:00 AM"
                                    value={form.data.opening_hours}
                                    onChange={(e) => form.setData('opening_hours', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Format each schedule on a new line (e.g. Day Range: Hours). It will dynamically render across the website.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">About Story / Hero Description</label>
                            <textarea
                                rows={3}
                                value={form.data.about_text}
                                onChange={(e) => form.setData('about_text', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Kitchen Order Ticket (KOT) Dedicated Profile & Credentials */}
                    <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm dark:border-amber-500/20 dark:bg-slate-900">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                    <ChefHat className="h-5 w-5 text-amber-500" /> Kitchen Display & Staff Portal (KOT) Credentials
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Manage the dedicated credentials for the kitchen display system. Kitchen staff can log in using the portal URL below with their User ID & Password.
                                </p>
                            </div>

                            <a
                                href="/kitchen"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition-all cursor-pointer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> Open Kitchen Display
                            </a>
                        </div>

                        {/* Dedicated Kitchen Login URL Box */}
                        <div className="rounded-2xl border border-amber-500/30 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                                <span className="flex items-center gap-1.5">
                                    <Globe className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Kitchen Staff Dedicated Login URL</span>
                                </span>
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Share with Kitchen Staff</span>
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/kitchen/login` : '/kitchen/login'}
                                    className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 font-mono text-xs font-bold text-slate-800 select-all dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const loginUrl = `${window.location.origin}/kitchen/login`;
                                        navigator.clipboard.writeText(loginUrl);
                                        setCopiedKotUrl(true);
                                        showToast('Kitchen Login URL copied to clipboard!', 'success');
                                        setTimeout(() => setCopiedKotUrl(false), 2500);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
                                >
                                    {copiedKotUrl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span>{copiedKotUrl ? 'Copied to Clipboard!' : 'Copy Login URL'}</span>
                                </button>
                                <a
                                    href="/kitchen/login"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Preview Login Page</span>
                                </a>
                            </div>
                        </div>

                        {/* 4-Field Grid for Kitchen Staff Credentials */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Station Display Name */}
                            <div>
                                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                                    Station / Chef Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kitchen Head Chef"
                                    value={form.data.kot_name}
                                    onChange={(e) => form.setData('kot_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Display name shown on the KOT terminal screen.
                                </p>
                            </div>

                            {/* User ID / Username */}
                            <div>
                                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                                    Kitchen User ID *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. kitchen"
                                    value={form.data.kot_username}
                                    onChange={(e) => form.setData('kot_username', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono font-bold text-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-amber-400"
                                />
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Kitchen staff can enter this User ID to log in.
                                </p>
                            </div>

                            {/* Account Email */}
                            <div>
                                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                                    Kitchen Account Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.data.kot_email}
                                    onChange={(e) => form.setData('kot_email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                />
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Account email associated with kitchen user.
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">
                                    Kitchen Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKotPassword ? 'text' : 'password'}
                                        required
                                        value={form.data.kot_password}
                                        onChange={(e) => form.setData('kot_password', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-white py-2 pr-10 pl-3.5 font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKotPassword(!showKotPassword)}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        title={showKotPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showKotPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-amber-500" />}
                                    </button>
                                </div>
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Toggle eye icon to view or edit kitchen password.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Configurations & Week Start Selection */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                            <Calendar className="h-4 w-4 text-amber-500" /> Calendar, Week Start Day & Financial Rules
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Week Starts On Select Dropdown */}
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 dark:border-amber-500/20">
                                <label className="mb-1 block font-bold text-amber-800 dark:text-amber-400">
                                    Week Starts On *
                                </label>
                                <select
                                    value={form.data.week_start_day}
                                    onChange={(e) => form.setData('week_start_day', e.target.value)}
                                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-2 font-bold text-slate-900 shadow-sm focus:border-amber-600 dark:border-amber-500/40 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="saturday">Saturday (Default)</option>
                                    <option value="sunday">Sunday</option>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                </select>
                                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                    Weekly trends, dashboard metrics, and P&L reports calculate from this day.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                    Default Currency Symbol (e.g. ৳ or BDT)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.data.default_currency}
                                    onChange={(e) => form.setData('default_currency', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">VAT / Tax Percentage (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={form.data.tax_percentage}
                                    onChange={(e) => form.setData('tax_percentage', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                    Stock Usage Warning Threshold (%) *
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="100"
                                    required
                                    value={form.data.expiry_warning_threshold}
                                    onChange={(e) => form.setData('expiry_warning_threshold', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-amber-600 dark:border-slate-800 dark:bg-slate-950 dark:text-amber-400"
                                />
                                <p className="mt-1 text-[10px] text-slate-400">Triggers warning notification when item used amount reaches this %</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media & Maps */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Social Links & Google Maps Embed</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Facebook Page URL</label>
                                <input
                                    type="text"
                                    value={form.data.social_facebook}
                                    onChange={(e) => form.setData('social_facebook', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Instagram Profile URL</label>
                                <input
                                    type="text"
                                    value={form.data.social_instagram}
                                    onChange={(e) => form.setData('social_instagram', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Twitter / X URL</label>
                                <input
                                    type="text"
                                    value={form.data.social_twitter}
                                    onChange={(e) => form.setData('social_twitter', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Google Maps Embed HTML Iframe</label>
                            <textarea
                                rows={3}
                                placeholder="<iframe src='https://www.google.com/maps/embed?...' ...></iframe>"
                                value={form.data.google_maps_embed}
                                onChange={(e) => form.setData('google_maps_embed', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Legal Policies & Footer Note */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Legal, Policies & Footer Branding</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Terms & Conditions Note</label>
                                <textarea
                                    rows={2}
                                    value={form.data.terms_conditions}
                                    onChange={(e) => form.setData('terms_conditions', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Privacy Policy Statement</label>
                                <textarea
                                    rows={2}
                                    value={form.data.privacy_policy}
                                    onChange={(e) => form.setData('privacy_policy', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Footer Copyright Statement</label>
                            <input
                                type="text"
                                value={form.data.footer_text}
                                onChange={(e) => form.setData('footer_text', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Saving Configurations...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Save All Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
