import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Download, Globe, Image as ImageIcon, MessageCircle, Save, Settings, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';

interface SettingsData {
    brand_name: string;
    brand_logo?: string;
    brand_icon?: string;
    tagline: string;
    about_text: string;
    phone: string;
    whatsapp_number?: string;
    email: string;
    notification_email: string;
    address: string;
    opening_hours: string;
    logo_url?: string;
    default_currency: string;
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
}

interface Props {
    settings: SettingsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'App Branding & Settings', href: '/admin/settings' },
];

export default function SettingsIndex({ settings }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(settings.brand_logo || null);
    const [iconPreview, setIconPreview] = useState<string | null>(settings.brand_icon || null);
    const [heroBgPreview, setHeroBgPreview] = useState<string | null>(settings.hero_bg_image || null);
    const [atmospherePreview, setAtmospherePreview] = useState<string | null>(settings.atmosphere_image || null);
    const [vipLoungePreview, setVipLoungePreview] = useState<string | null>(settings.vip_lounge_image || null);

    const form = useForm({
        brand_name: settings.brand_name || 'NOCTURNE',
        brand_logo: settings.brand_logo || '/uploads/branding/logo.svg',
        brand_icon: settings.brand_icon || '/uploads/branding/icon.svg',
        brand_logo_file: null as File | null,
        brand_icon_file: null as File | null,
        hero_bg_file: null as File | null,
        atmosphere_image_file: null as File | null,
        vip_lounge_image_file: null as File | null,
        tagline: settings.tagline || 'CRAVINGS NEVER SLEEP',
        about_text: settings.about_text || '',
        phone: settings.phone || '+8801700000000',
        whatsapp_number: settings.whatsapp_number || settings.phone || '+8801700000000',
        email: settings.email || 'contact@restaurant.com',
        notification_email: settings.notification_email || 'admin@restaurant.com',
        address: settings.address || '889 Midnight Ave, Suite B, Downtown District',
        opening_hours: settings.opening_hours || 'Mon - Sun: 8:00 PM - 4:00 AM',
        logo_url: settings.logo_url || '',
        default_currency: settings.default_currency || '৳',
        tax_percentage: settings.tax_percentage || '5.0',
        expiry_warning_threshold: settings.expiry_warning_threshold || '80',
        google_maps_embed: settings.google_maps_embed || '',
        social_facebook: settings.social_facebook || '#',
        social_instagram: settings.social_instagram || '#',
        social_twitter: settings.social_twitter || '#',
        terms_conditions: settings.terms_conditions || '',
        privacy_policy: settings.privacy_policy || '',
        footer_text: settings.footer_text || '',
    });

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('brand_logo_file', file);
            setLogoPreview(URL.createObjectURL(file));
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

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/settings', {
            forceFormData: true,
            onSuccess: () => showToast('App branding, background images & settings saved successfully!', 'success'),
        });
    };

    const downloadDatabaseBackup = () => {
        window.location.href = '/admin/settings/backup';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Branding & System Settings" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Settings className="h-6 w-6 text-amber-500" /> App Branding, WhatsApp & Surface Settings
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Configure restaurant branding, background photography, WhatsApp contact integration, tax %, and database backup
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={downloadDatabaseBackup}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Download Database Backup JSON
                        </button>
                    </div>
                </div>

                <form onSubmit={submitForm} className="space-y-6 text-xs">
                    {/* Brand Assets Upload (Logo & Icon) */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                            <ImageIcon className="h-4 w-4 text-amber-500" /> Brand Identity Assets (Logo & Favicon Icon)
                        </h3>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Brand Logo Upload */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <label className="block font-bold text-slate-800 dark:text-slate-200">
                                    Full Brand Logo Image (Displayed on Landing Header & App Header)
                                </label>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-36 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Brand Logo Preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-slate-400">No Logo</span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoFileChange}
                                            className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950 hover:file:bg-amber-400"
                                        />
                                        <p className="text-[10px] text-slate-400">Preview active before upload. PNG/SVG recommended (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Icon Upload */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <label className="block font-bold text-slate-800 dark:text-slate-200">
                                    Brand Favicon & Icon (Browser Tab Icon & Mobile Favicon)
                                </label>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                        {iconPreview ? (
                                            <img src={iconPreview} alt="Brand Icon Preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-slate-400">No Icon</span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleIconFileChange}
                                            className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950 hover:file:bg-amber-400"
                                        />
                                        <p className="text-[10px] text-slate-400">Square PNG/SVG/ICO 512x512px (Max 2MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Surface Landing Page Background Photography (Changeable with Preview) */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                <Sparkles className="h-4 w-4 text-orange-500" /> Surface Landing Page Background Images (With Live Preview)
                            </h3>
                            <span className="text-[11px] text-slate-400">Instant client-side preview before saving</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* 1. Hero Section Background */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
                                <div>
                                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                                        1. Hero Section Background
                                    </label>
                                    <p className="text-[11px] text-slate-500 mb-3">Main display backdrop behind "Cravings Never Sleep"</p>

                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-inner dark:border-slate-800 mb-3">
                                        {heroBgPreview ? (
                                            <img src={heroBgPreview} alt="Hero Background Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                                                Default Gourmet Hero Photo
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

                        {/* WhatsApp Number Highlight Field */}
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 dark:border-emerald-500/20">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                                        <MessageCircle className="h-4 w-4" /> Dedicated WhatsApp Order Number (Country Code + Number) *
                                    </label>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        All surface WhatsApp CTA buttons, recipe ordering, and the bottom-left floating WhatsApp widget will connect to this number.
                                    </p>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. +8801700000000 or 8801700000000"
                                        value={form.data.whatsapp_number}
                                        onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                                        className="w-full rounded-xl border border-emerald-400 bg-white px-3.5 py-2.5 font-mono text-sm font-bold text-emerald-900 shadow-sm focus:border-emerald-600 dark:border-emerald-500/40 dark:bg-slate-950 dark:text-emerald-300"
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
                                    rows={2}
                                    value={form.data.address}
                                    onChange={(e) => form.setData('address', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Opening Hours</label>
                                <textarea
                                    rows={2}
                                    value={form.data.opening_hours}
                                    onChange={(e) => form.setData('opening_hours', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
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

                    {/* Operational Configurations */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Financial & Operational Metrics</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                    Expiry / Stock Usage Warning Threshold (%) *
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
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Twitter / X Profile URL</label>
                                <input
                                    type="text"
                                    value={form.data.social_twitter}
                                    onChange={(e) => form.setData('social_twitter', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                Google Maps Embed iframe HTML / Code (Rendered in Location Section)
                            </label>
                            <textarea
                                rows={3}
                                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                value={form.data.google_maps_embed}
                                onChange={(e) => form.setData('google_maps_embed', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Legal Policies */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Legal Policies & Footer Notice</h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Terms & Conditions</label>
                                <textarea
                                    rows={3}
                                    value={form.data.terms_conditions}
                                    onChange={(e) => form.setData('terms_conditions', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Privacy Policy</label>
                                <textarea
                                    rows={3}
                                    value={form.data.privacy_policy}
                                    onChange={(e) => form.setData('privacy_policy', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Footer Copyright Text</label>
                            <input
                                type="text"
                                value={form.data.footer_text}
                                onChange={(e) => form.setData('footer_text', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                        <span className="text-slate-500 dark:text-slate-400">All image changes and WhatsApp settings will be reflected across the surface frontend immediately.</span>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" /> {form.processing ? 'Saving...' : 'Save App Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
