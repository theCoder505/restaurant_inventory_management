import AppLayout from '@/layouts/app-layout';
import { showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Download, Globe, Image as ImageIcon, Save, Settings } from 'lucide-react';
import { useState } from 'react';

interface SettingsData {
    brand_name: string;
    brand_logo?: string;
    brand_icon?: string;
    tagline: string;
    about_text: string;
    phone: string;
    email: string;
    notification_email: string;
    address: string;
    opening_hours: string;
    logo_url?: string;
    default_currency: string;
    tax_percentage: string;
    low_stock_threshold_default: string;
    google_maps_embed: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    terms_conditions: string;
    privacy_policy: string;
    footer_text: string;
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

    const form = useForm({
        brand_name: settings.brand_name || 'Le Gourmet Bistro',
        brand_logo: settings.brand_logo || '/uploads/branding/logo.svg',
        brand_icon: settings.brand_icon || '/uploads/branding/icon.svg',
        brand_logo_file: null as File | null,
        brand_icon_file: null as File | null,
        tagline: settings.tagline || 'Artisan Culinary & Fresh Restaurant',
        about_text: settings.about_text || '',
        phone: settings.phone || '+880 1711 000 000',
        email: settings.email || 'info@legourmetbistro.com',
        notification_email: settings.notification_email || 'admin@legourmetbistro.com',
        address: settings.address || '45 Artisan Boulevard, Gulshan 2, Dhaka 1212',
        opening_hours: settings.opening_hours || 'Mon - Sun: 11:00 AM - 11:00 PM',
        logo_url: settings.logo_url || '',
        default_currency: settings.default_currency || '৳',
        tax_percentage: settings.tax_percentage || '5.0',
        low_stock_threshold_default: settings.low_stock_threshold_default || '5',
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

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/settings', {
            forceFormData: true,
            onSuccess: () => showToast('App branding, logo & system settings saved!', 'success'),
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
                            <Settings className="h-6 w-6 text-amber-500" /> App Branding, Tax & System Settings
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Configure restaurant brand name, logo, favicon icon, currency, tax %, WhatsApp contact, and database backup
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
                            <ImageIcon className="h-4 w-4 text-amber-500" /> Brand Image Assets (Logo & Favicon Icon)
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
                                        <p className="text-[10px] text-slate-400">Recommended: PNG or SVG with transparent background (Max 4MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Icon Upload */}
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                <label className="block font-bold text-slate-800 dark:text-slate-200">
                                    Brand Favicon & Icon (Displayed in Browser Tabs & Sidebar Logo)
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
                                        <p className="text-[10px] text-slate-400">Recommended: Square PNG/SVG 512x512px (Max 2MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Branding */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                            <Globe className="h-4 w-4 text-amber-500" /> Restaurant Branding & Contact Details
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">WhatsApp / Contact Phone *</label>
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
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Default Low Stock Threshold</label>
                                <input
                                    type="number"
                                    required
                                    value={form.data.low_stock_threshold_default}
                                    onChange={(e) => form.setData('low_stock_threshold_default', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Google Maps Embed HTML Code</label>
                            <textarea
                                rows={2}
                                value={form.data.google_maps_embed}
                                onChange={(e) => form.setData('google_maps_embed', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-mono text-[11px] text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                        >
                            <Save className="h-4 w-4" /> Save App Settings
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
