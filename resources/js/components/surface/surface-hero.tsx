import { Link } from '@inertiajs/react';
import { ArrowRight, Flame, Phone, Sparkles } from 'lucide-react';
import React from 'react';

const DEFAULT_HERO_BG =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw';

export interface SurfaceHeroSettings {
    brand_name: string;
    tagline?: string;
    about_text?: string;
    phone?: string;
    whatsapp_number?: string;
    enable_whatsapp?: boolean;
    hero_bg_image?: string;
    [key: string]: any;
}

export interface SurfaceHeroProps {
    settings: SurfaceHeroSettings;
    heroBgImage?: string;
    generateOrderLink?: (dishName?: string) => string;
    isWhatsAppEnabled?: boolean;
}

export default function SurfaceHero({
    settings,
    heroBgImage,
    generateOrderLink,
    isWhatsAppEnabled,
}: SurfaceHeroProps) {
    const bgImage = heroBgImage || settings.hero_bg_image || DEFAULT_HERO_BG;
    const whatsappActive =
        isWhatsAppEnabled !== undefined
            ? isWhatsAppEnabled
            : settings.enable_whatsapp !== false;

    const targetPhone = whatsappActive
        ? settings.whatsapp_number || settings.phone || '+8801700000000'
        : settings.phone || '+8801700000000';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    const orderLink = generateOrderLink
        ? generateOrderLink()
        : whatsappActive
          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello ${settings.brand_name || 'Restaurant'}, I have an inquiry about reservations and late-night delivery.`,
            )}`
          : `tel:${cleanPhone}`;

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
            {/* Background Photography & Gradients */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage}
                    alt="Late night gourmet dining atmosphere"
                    className="h-full w-full object-cover object-center scale-105 filter brightness-75 dark:brightness-50 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/85 dark:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent dark:from-[#0a0a0a] dark:via-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl space-y-6" data-aos="fade-up" data-aos-duration="900">
                    {/* Live Status Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-4 py-1.5 backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                        </span>
                        <span className="font-montserrat text-xs font-bold uppercase tracking-widest text-orange-200 dark:text-orange-300">
                            24/7 Late-Night Kitchen Active
                        </span>
                    </div>

                    {/* Main Display Headline */}
                    <h1 className="font-montserrat text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-none drop-shadow-2xl">
                        Cravings <br />
                        <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Never Sleep.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="font-inter text-base sm:text-lg text-slate-100/95 leading-relaxed max-w-xl drop-shadow">
                        {settings.about_text ||
                            'Step into a world where culinary excellence meets nightlife seduction. Experience gourmet fast food crafted for the late-night elite.'}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-3">
                        <a
                            href={orderLink}
                            target={whatsappActive ? '_blank' : undefined}
                            rel={whatsappActive ? 'noopener noreferrer' : undefined}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-4 font-montserrat text-sm font-extrabold uppercase tracking-wider text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 hover:brightness-110 active:scale-95 neon-glow text-center"
                        >
                            {whatsappActive ? (
                                <Flame className="h-5 w-5 fill-current" />
                            ) : (
                                <Phone className="h-5 w-5" />
                            )}
                            <span>{whatsappActive ? 'Ignite Order' : 'Call Kitchen'}</span>
                        </a>
                        <Link
                            href="/recipes"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-4 font-montserrat text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-95 text-center"
                        >
                            <span>Explore All Recipes</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
