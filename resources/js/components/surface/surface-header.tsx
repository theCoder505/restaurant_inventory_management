import { useAppearance } from '@/hooks/use-appearance';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Compass,
    Flame,
    Menu as MenuIcon,
    MessageCircle,
    Moon,
    Phone,
    Sparkles,
    Sun,
    Utensils,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SurfaceSettings {
    brand_name: string;
    brand_logo?: string;
    brand_icon?: string;
    logo_url?: string;
    phone: string;
    whatsapp_number?: string;
    enable_whatsapp?: boolean;
    email?: string;
    address?: string;
    opening_hours?: string;
    tagline?: string;
    about_text?: string;
    default_currency?: string;
    week_start_day?: string;
    google_maps_embed?: string;
    social_facebook?: string;
    social_instagram?: string;
    social_twitter?: string;
    terms_conditions?: string;
    privacy_policy?: string;
    footer_text?: string;
    hero_bg_image?: string;
    atmosphere_image?: string;
    vip_lounge_image?: string;
}

interface SurfaceHeaderProps {
    settings: SurfaceSettings;
    isSubpage?: boolean;
    backUrl?: string;
    backLabel?: string;
    customOrderText?: string;
}

export default function SurfaceHeader({
    settings,
    isSubpage = false,
    backUrl = '/#lineup',
    backLabel = 'Back To Menu',
    customOrderText,
}: SurfaceHeaderProps) {
    const { appearance, updateAppearance } = useAppearance();
    const isDarkMode = appearance === 'dark';

    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const heroSection = document.getElementById('hero-section');
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                // Add background only after the hero section is fully scrolled past the header
                setIsScrolled(heroRect.bottom <= 70);
            } else {
                setIsScrolled(window.scrollY > 40);
            }

            if (isSubpage) return;

            // Scrollspy active section tracking
            const sections = ['atmosphere', 'lineup', 'specials', 'tracker', 'locations'];
            const scrollPosition = window.scrollY + 200;

            let currentActive = '';
            for (let i = sections.length - 1; i >= 0; i--) {
                const sectionId = sections[i];
                const element = document.getElementById(sectionId);
                if (element) {
                    const top = element.offsetTop;
                    if (scrollPosition >= top) {
                        currentActive = sectionId;
                        break;
                    }
                }
            }
            setActiveSection(currentActive);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isSubpage]);

    const isWhatsAppEnabled = settings.enable_whatsapp !== false;
    const targetPhone = isWhatsAppEnabled
        ? settings.whatsapp_number || settings.phone || '+8801700000000'
        : settings.phone || '+8801700000000';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    const generateOrderLink = () => {
        if (!isWhatsAppEnabled) {
            return `tel:${cleanPhone}`;
        }
        const text = customOrderText
            ? `Hello ${settings.brand_name}, I would like to order: ${customOrderText}`
            : `Hello ${settings.brand_name}, I have an inquiry about menu, specials, and late-night delivery.`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    };

    const brandLogoImage = settings.brand_logo || settings.logo_url;

    // Determine header style: transparent over hero if not scrolled, not subpage, and mobile menu closed
    const isHeaderTransparent = !isScrolled && !isSubpage && !mobileMenuOpen;

    const navItems = [
        { id: 'lineup', label: 'The Lineup', href: '/#lineup', isAnchor: true },
        { id: 'recipes', label: 'Recipes', href: '/recipes', isAnchor: false },
        { id: 'atmosphere', label: 'Atmosphere', href: '/#atmosphere', isAnchor: true },
        { id: 'specials', label: 'Exclusives', href: '/#specials', isAnchor: true },
        { id: 'tracker', label: 'Live Radar', href: '/#tracker', isAnchor: true },
        { id: 'locations', label: 'Find Us', href: '/#locations', isAnchor: true },
    ];

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${
                isHeaderTransparent
                    ? 'border-b border-transparent bg-transparent'
                    : 'border-b border-slate-200/90 bg-white/95 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-black/95 dark:shadow-black/50'
            }`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                {/* Left Section: Back Button (subpages) + Brand Logo */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {isSubpage && (
                        <Link
                            href={backUrl}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3.5 py-2 font-montserrat text-xs font-bold uppercase text-slate-800 transition-all hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 active:scale-95 shadow-sm"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{backLabel}</span>
                        </Link>
                    )}

                    <Link href="/" className="flex items-center gap-2.5 group">
                        {brandLogoImage ? (
                            <img
                                src={brandLogoImage}
                                alt={settings.brand_name}
                                className={`h-9 sm:h-10 w-auto object-contain max-w-[160px] sm:max-w-[200px] transition-all duration-300 ${
                                    isHeaderTransparent
                                        ? 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]'
                                        : ''
                                }`}
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                                <Flame className="h-5 w-5 fill-current" />
                            </div>
                        )}
                    </Link>
                </div>

                {/* Desktop Navigation Links with Scrollspy Active Activation */}
                <nav className="hidden lg:flex items-center gap-7 font-inter text-sm">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const isLinkElement = !item.isAnchor;

                        if (isLinkElement) {
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`relative py-1 transition-all font-semibold ${
                                        isHeaderTransparent
                                            ? 'text-white/90 hover:text-orange-400 drop-shadow-sm'
                                            : 'text-slate-800 hover:text-orange-600 dark:text-stone-200 dark:hover:text-orange-400'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        }

                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`relative py-1 transition-all ${
                                    isHeaderTransparent
                                        ? isActive
                                            ? 'text-orange-400 font-extrabold drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]'
                                            : 'text-white/90 hover:text-orange-400 font-semibold drop-shadow-sm'
                                        : isActive
                                        ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                                        : 'text-slate-800 hover:text-orange-600 dark:text-stone-200 dark:hover:text-orange-400 font-semibold'
                                }`}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-orange-500 shadow-sm transition-all" />
                                )}
                            </a>
                        );
                    })}
                </nav>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Theme Switcher */}
                    <button
                        onClick={() => updateAppearance(isDarkMode ? 'light' : 'dark')}
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full shadow-sm transition-all active:scale-95 ${
                            isHeaderTransparent
                                ? 'border border-white/30 bg-black/30 backdrop-blur-md text-white hover:bg-black/50'
                                : 'border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-amber-300 dark:hover:bg-white/15'
                        }`}
                        title="Toggle Light / Dark Mode"
                        aria-label="Toggle Light / Dark Mode"
                    >
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>

                    {/* Order CTA (WhatsApp if enabled, otherwise Phone Call) */}
                    <a
                        href={generateOrderLink()}
                        target={isWhatsAppEnabled ? '_blank' : undefined}
                        rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 sm:px-5 py-2 sm:py-2.5 font-montserrat text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 transition-all hover:brightness-110 active:scale-95 neon-glow-hover"
                    >
                        {isWhatsAppEnabled ? (
                            <Flame className="h-3.5 w-3.5 fill-current" />
                        ) : (
                            <Phone className="h-3.5 w-3.5" />
                        )}
                        <span>{customOrderText ? 'Order Recipe' : isWhatsAppEnabled ? 'Order Now' : 'Call Kitchen'}</span>
                    </a>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl lg:hidden shadow-sm transition-all ${
                            isHeaderTransparent
                                ? 'border border-white/30 bg-black/30 backdrop-blur-md text-white'
                                : 'border border-slate-300 bg-slate-100 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-slate-100'
                        }`}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu Sheet with Active State Highlighting */}
            {mobileMenuOpen && (
                <div className="border-b border-slate-200/90 bg-white/95 px-5 py-6 shadow-2xl backdrop-blur-2xl lg:hidden dark:border-white/10 dark:bg-stone-950/95 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-2 font-montserrat text-sm uppercase tracking-wider">
                        <a
                            href="/#lineup"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                activeSection === 'lineup'
                                    ? 'bg-orange-50 text-orange-600 font-extrabold dark:bg-orange-500/15 dark:text-orange-400'
                                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold'
                            }`}
                        >
                            <Utensils className="h-4 w-4 text-orange-500" />
                            <span>The Lineup (Menu)</span>
                        </a>

                        <Link
                            href="/recipes"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl p-3 text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold transition-colors"
                        >
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            <span>All Recipes</span>
                        </Link>

                        <a
                            href="/#atmosphere"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                activeSection === 'atmosphere'
                                    ? 'bg-orange-50 text-orange-600 font-extrabold dark:bg-orange-500/15 dark:text-orange-400'
                                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold'
                            }`}
                        >
                            <Sparkles className="h-4 w-4 text-orange-500" />
                            <span>Atmosphere</span>
                        </a>

                        <a
                            href="/#specials"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                activeSection === 'specials'
                                    ? 'bg-orange-50 text-orange-600 font-extrabold dark:bg-orange-500/15 dark:text-orange-400'
                                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold'
                            }`}
                        >
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span>Chef Exclusives</span>
                        </a>

                        <a
                            href="/#tracker"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                activeSection === 'tracker'
                                    ? 'bg-orange-50 text-orange-600 font-extrabold dark:bg-orange-500/15 dark:text-orange-400'
                                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold'
                            }`}
                        >
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>Live Kitchen Radar</span>
                        </a>

                        <a
                            href="/#locations"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                activeSection === 'locations'
                                    ? 'bg-orange-50 text-orange-600 font-extrabold dark:bg-orange-500/15 dark:text-orange-400'
                                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5 font-bold'
                            }`}
                        >
                            <Compass className="h-4 w-4 text-orange-500" />
                            <span>Find Us & Hours</span>
                        </a>

                        <div className="pt-3 mt-1 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
                            <a
                                href={generateOrderLink()}
                                target={isWhatsAppEnabled ? '_blank' : undefined}
                                rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-orange-500/20"
                            >
                                {isWhatsAppEnabled ? (
                                    <>
                                        <MessageCircle className="h-4 w-4" />
                                        <span>Order via WhatsApp</span>
                                    </>
                                ) : (
                                    <>
                                        <Phone className="h-4 w-4" />
                                        <span>Call Kitchen: {settings.phone}</span>
                                    </>
                                )}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
