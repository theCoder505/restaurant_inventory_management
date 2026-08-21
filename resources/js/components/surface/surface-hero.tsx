import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChefHat,
    Flame,
    Phone,
    ShieldCheck,
    Sparkles,
    Timer,
    Utensils,
    Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 300;

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
    generateOrderLink,
    isWhatsAppEnabled,
}: SurfaceHeroProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));

    const targetFrameRef = useRef<number>(1);
    const currentFrameRef = useRef<number>(1);
    const isInitialFrameDrawnRef = useRef<boolean>(false);
    const animFrameIdRef = useRef<number | null>(null);

    const [loadedCount, setLoadedCount] = useState<number>(0);
    const [isLoaderHidden, setIsLoaderHidden] = useState<boolean>(false);
    const [scrollProgress, setScrollProgress] = useState<number>(0);

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
                `Hello ${settings.brand_name || 'Restaurant'}, I would like to place an inquiry for late-night gourmet dining and delivery.`,
            )}`
          : `tel:${cleanPhone}`;

    // Generates 3-digit zero-padded frame paths (/images/frames/ezgif-frame-001.jpg)
    const getFrameUrl = (index: number) => {
        const paddedIndex = String(index).padStart(3, '0');
        return `/images/frames/ezgif-frame-${paddedIndex}.jpg`;
    };

    // Renders specified frame to canvas using image cover calculation
    const renderFrame = (frameIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
        let img = framesRef.current[safeIndex];

        // Fallback to nearest preloaded frame if current frame image is downloading
        if (!img || !img.complete || img.naturalWidth === 0) {
            for (let offset = 1; offset <= 30; offset++) {
                const prev = safeIndex - offset;
                if (
                    prev >= 1 &&
                    framesRef.current[prev] &&
                    framesRef.current[prev]!.complete &&
                    framesRef.current[prev]!.naturalWidth > 0
                ) {
                    img = framesRef.current[prev];
                    break;
                }
                const next = safeIndex + offset;
                if (
                    next <= TOTAL_FRAMES &&
                    framesRef.current[next] &&
                    framesRef.current[next]!.complete &&
                    framesRef.current[next]!.naturalWidth > 0
                ) {
                    img = framesRef.current[next];
                    break;
                }
            }
        }

        if (!img || !img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // Cover fit logic
        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const cx = (cw - nw) / 2;
        const cy = (ch - nh) / 2;

        ctx.drawImage(img, cx, cy, nw, nh);
    };

    // Handles Retina/High-DPI displays while ensuring canvas fits viewport
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        renderFrame(Math.round(currentFrameRef.current));
    };

    // Update target frame based on sticky scroll container progress
    const updateTargetFrame = () => {
        const heroSection = sectionRef.current;
        if (!heroSection) return;

        const rect = heroSection.getBoundingClientRect();
        const scrollableDistance = heroSection.offsetHeight - window.innerHeight;

        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        setScrollProgress(progress);

        // Map progress (0.0 to 0.88) to frames (1 to 300).
        // The remaining progress (0.88 to 1.0) locks on frame 300 before unpinning to next section.
        const PLAYBACK_END_RATIO = 0.88;
        const normalizedProgress = Math.min(1, progress / PLAYBACK_END_RATIO);

        targetFrameRef.current = 1 + normalizedProgress * (TOTAL_FRAMES - 1);
    };

    useEffect(() => {
        let isMounted = true;

        // Priority 1: First frame for instant render
        const firstImg = new Image();
        firstImg.src = getFrameUrl(1);
        firstImg.onload = () => {
            if (!isMounted) return;
            framesRef.current[1] = firstImg;
            setLoadedCount((prev) => prev + 1);

            if (!isInitialFrameDrawnRef.current) {
                renderFrame(1);
                isInitialFrameDrawnRef.current = true;
            }
            startBatchLoading();
        };
        firstImg.onerror = () => {
            if (!isMounted) return;
            startBatchLoading();
        };

        // Priority 2: Asynchronous batch preloading for the remaining frames
        const startBatchLoading = () => {
            for (let i = 2; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = getFrameUrl(i);
                img.onload = () => {
                    if (!isMounted) return;
                    framesRef.current[i] = img;
                    setLoadedCount((prev) => prev + 1);
                };
                img.onerror = () => {
                    if (!isMounted) return;
                    setLoadedCount((prev) => prev + 1);
                };
            }
        };

        // Smooth Lerp Animation Loop
        const animate = () => {
            const delta = targetFrameRef.current - currentFrameRef.current;
            if (Math.abs(delta) > 0.001) {
                currentFrameRef.current += delta * 0.35;
                renderFrame(Math.round(currentFrameRef.current));
            }
            animFrameIdRef.current = requestAnimationFrame(animate);
        };

        const handleScroll = () => {
            updateTargetFrame();
        };

        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        // Initial setup
        resizeCanvas();
        updateTargetFrame();
        animFrameIdRef.current = requestAnimationFrame(animate);

        return () => {
            isMounted = false;
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (animFrameIdRef.current) {
                cancelAnimationFrame(animFrameIdRef.current);
            }
        };
    }, []);

    // Manage preloader fadeout
    const loadPercent = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
    useEffect(() => {
        if (loadPercent >= 100 || loadedCount >= 45) {
            const timer = setTimeout(() => {
                setIsLoaderHidden(true);
            }, 750);
            return () => clearTimeout(timer);
        }
    }, [loadPercent, loadedCount]);

    // Card Visibility States
    const isCard1Visible = scrollProgress < 0.28;
    const isCard2Visible = scrollProgress >= 0.35 && scrollProgress < 0.68;
    const isScrollHintVisible = scrollProgress <= 0.03;

    return (
        <section
            id="hero-section"
            ref={sectionRef}
            className="relative bg-[#070b19] dark:bg-[#070b19] h-[450vh] sm:h-[500vh] select-none"
        >
            {/* Sticky Screen Pinned Container */}
            <div
                id="hero-pin"
                className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b19] z-10"
            >
                {/* High-Performance Canvas Element */}
                <canvas
                    id="hero-canvas"
                    ref={canvasRef}
                    className="w-full h-full object-cover block pointer-events-none"
                />

                {/* Soft Ambient Vignette & Gradient Overlays for High-Contrast Readability */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#070b19]/80 via-transparent to-[#070b19] z-10" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-[#070b19]/40 to-[#070b19]/90 z-10" />

                {/* Preloader Spinner & Progress */}
                {!isLoaderHidden && (
                    <div
                        className={`absolute inset-0 bg-[#070b19] flex flex-col items-center justify-center transition-opacity duration-700 z-30 pointer-events-none ${
                            loadPercent >= 100 || loadedCount >= 45
                                ? 'opacity-0'
                                : 'opacity-100'
                        }`}
                    >
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                            </div>
                        </div>
                        <span className="text-orange-200/90 text-xs font-montserrat font-bold tracking-widest uppercase">
                            Preparing Experience... {loadPercent}%
                        </span>
                    </div>
                )}

                {/* Hero Overlay Stage 1: Initial Brand & Live Ordering */}
                <div
                    className={`absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl transition-all duration-700 text-center ${
                        isCard1Visible
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                    {/* Live Status Pill */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/20 px-4 py-1.5 backdrop-blur-md shadow-lg shadow-orange-500/10 mb-5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                        </span>
                        <span className="font-montserrat text-xs font-bold uppercase tracking-widest text-orange-200 dark:text-orange-300">
                            24/7 Late-Night Kitchen Active • Hot &amp; Fresh
                        </span>
                    </div>

                    {/* Brand Headline */}
                    <h1 className="font-montserrat text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-tight mb-4 drop-shadow-2xl">
                        Where Gastronomy Meets <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                            Midnight Seduction
                        </span>
                    </h1>

                    {/* Brand Description */}
                    <p className="font-inter text-sm sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto mb-8 drop-shadow-md">
                        {settings.about_text ||
                            'Step into a world where culinary excellence meets nightlife seduction. Indulge in artisanal burgers, sizzling wood-fired specialties, and gourmet comfort crafted for those who thrive after hours.'}
                    </p>

                    {/* Action CTAs */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <a
                            href={orderLink}
                            target={whatsappActive ? '_blank' : undefined}
                            rel={whatsappActive ? 'noopener noreferrer' : undefined}
                            className="px-8 py-4 rounded-full font-montserrat font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 text-center neon-glow"
                        >
                            {whatsappActive ? (
                                <Flame className="h-4 sm:h-5 w-4 sm:w-5 fill-current" />
                            ) : (
                                <Phone className="h-4 sm:h-5 w-4 sm:w-5" />
                            )}
                            <span>{whatsappActive ? 'Ignite Your Order' : 'Call The Kitchen'}</span>
                        </a>

                        <Link
                            href="/recipes"
                            className="px-8 py-4 rounded-full font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider text-white border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-center"
                        >
                            <span>Explore Lineup</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs font-montserrat text-slate-300/85">
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <span>100% Flame-Grilled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-amber-400" />
                            <span>Master Crafted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-400" />
                            <span>Thermal Express Delivery</span>
                        </div>
                    </div>
                </div>

                {/* Hero Overlay Stage 2: Appears Mid-Scroll with Recipe & Craftsmanship Story */}
                <div
                    className={`absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl transition-all duration-700 text-center ${
                        isCard2Visible
                            ? 'opacity-100 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1.5 backdrop-blur-md shadow-lg shadow-amber-500/10 mb-4">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span className="font-montserrat text-xs font-bold uppercase tracking-widest text-amber-200">
                            Artisanal Craftsmanship • Flame-Kissed Perfection
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 className="font-montserrat text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white leading-tight mb-4 drop-shadow-2xl">
                        Turn Pure Cravings Into <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            Gourmet Ecstasy
                        </span>
                    </h2>

                    {/* Subtitle */}
                    <p className="font-inter text-sm sm:text-base md:text-lg text-slate-200/95 font-normal leading-relaxed max-w-2xl mx-auto mb-8 drop-shadow-md">
                        Every single dish is seasoned with secret spice rubs, flash-seared over open flame, and delivered piping hot straight to your table or doorstep.
                    </p>

                    {/* Feature Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-left">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 mb-2 font-bold">
                                01
                            </div>
                            <h3 className="font-montserrat text-sm font-bold text-white uppercase tracking-wider">
                                Prime Cuts
                            </h3>
                            <p className="font-inter text-xs text-slate-300 mt-1">
                                Hand-selected meats &amp; freshly baked artisan brioche daily.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-left">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 font-bold">
                                02
                            </div>
                            <h3 className="font-montserrat text-sm font-bold text-white uppercase tracking-wider">
                                Signature Glazes
                            </h3>
                            <p className="font-inter text-xs text-slate-300 mt-1">
                                House-infused smoky BBQ, garlic truffle, and fiery chili reductions.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-left">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 mb-2 font-bold">
                                03
                            </div>
                            <h3 className="font-montserrat text-sm font-bold text-white uppercase tracking-wider">
                                Night Dispatch
                            </h3>
                            <p className="font-inter text-xs text-slate-300 mt-1">
                                Thermal insulated packaging keeping crunch and temperature intact.
                            </p>
                        </div>
                    </div>

                    {/* Explore Link */}
                    <div className="flex justify-center">
                        <a
                            href="/#lineup"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-montserrat font-bold text-xs uppercase tracking-wider text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <Utensils className="h-4 w-4 text-orange-400" />
                            <span>Discover Our Chef's Lineup</span>
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator Hint */}
                <div
                    id="scroll-hint"
                    className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500 ${
                        isScrollHintVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                    }`}
                >
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-300/80 font-montserrat font-medium drop-shadow-md">
                        Scroll to reveal
                    </span>
                    <div className="w-5 h-9 border-2 border-orange-400/40 rounded-full flex justify-center p-1 backdrop-blur-md bg-slate-900/50 shadow-lg">
                        <div className="w-1.5 h-2.5 bg-orange-400 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </section>
    );
}
