import SurfaceHero from '@/components/surface/surface-hero';
import SurfaceLayout from '@/components/surface/surface-layout';
import { formatCurrency } from '@/lib/swal';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Award,
    Bike,
    Bolt,
    BookOpen,
    ChefHat,
    Clock,
    Compass,
    Diamond,
    Flame,
    MapPin,
    MessageCircle,
    Navigation,
    Phone,
    Quote,
    Radio,
    Search,
    Sparkles,
    Star,
    Thermometer,
    Utensils,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Settings {
    brand_name: string;
    brand_logo?: string;
    brand_logo_dark?: string;
    brand_icon?: string;
    header_white_logo?: boolean | string;
    tagline: string;
    about_text: string;
    phone: string;
    whatsapp_number?: string;
    enable_whatsapp?: boolean;
    email: string;
    address: string;
    opening_hours: string;
    logo_url?: string;
    default_currency: string;
    google_maps_embed: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    terms_conditions?: string;
    privacy_policy?: string;
    footer_text: string;
    hero_bg_image?: string;
    atmosphere_image?: string;
    vip_lounge_image?: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    details?: string;
    price: number;
    image_path?: string;
    is_available: boolean;
    is_featured: boolean;
    category?: { id: number; name: string };
}

interface MenuCategory {
    id: number;
    name: string;
    description?: string;
    menu_items: MenuItem[];
}

interface ReviewItem {
    id?: number;
    customer_name: string;
    customer_title?: string;
    avatar_initials?: string;
    avatar_url?: string;
    rating: number;
    comment: string;
}

interface Props {
    settings: Settings;
    menuCategories: MenuCategory[];
    featuredItems: MenuItem[];
    reviews?: ReviewItem[];
}

// Fallback high-contrast culinary photography if no custom image is uploaded in Admin AppSettings
const DEFAULT_FALLBACK_IMAGES = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAgx_WRv3kuWUFuNT_Wia142uEUZYtTvie7-4E7aVozFm0HRA-dXviDoaRMcpRGlJlX6fR34IAi6c9iJOC8mgBeyRQP0FQgUP2uQximWxWWaYRDG1dRg-BHc_sohGQFcP9GIejGrZp93hsjNLMBJ_oUblGrTxNzidjyXOlfZ9OMah8LYLo7n8y1DSqi7rguI-skewLi1YLaj6TlviJV02EHc7PUpAmDP4SHhz4FWQMhZKYuOas0gHyyg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2LxGOqn8H8R482FU2ybovgZYVI73qnI0D-7A_qlb48iiZzKd1OqBYVB-Aw_-U_L40FiICYgyno3npqB_bo9E9vTV-vSfji9qvM2ACKrAol3QR-QKucFllf5kneD9Y5Y0Td0_LLHnk1BK2g8Fppq4Bax64oI5uT0Bg6tNDLqBhamGUzO5WGTgKP41S3_CuwMz46Nz98-_c8ch2VcOvJmk1ugwZgJQ7fonJL1LedVQ53seGQHFOvo7N-Q',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2_bVlvk1Q4Ba3dX6u6d1yxVzE8kiIZ6E2xlx8ZtxEYUlpCJ9BCu3SX-p4gr2MYdToU92-z_egfMoydPvEEM9lo_qEPATvFGEIispZE0dHgvLm0I_k3d9b2mm4K9_pNAHonyLyma_tnn8v6YNZHHA3OFlK4UO0PydJjf59Dm6GsnCkcQ9koHT0M21mRKaT8MDeWsgemp75RvkAqJIMpceQoyAC_UOJWs-MrT4RyD_rvoR9KZ7KNF8rPA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCaXOM7tTH5HnLYmcDiQLKL5bAhIGyALz8jLJw9l-qygbDG-NeP9rTsEcoMKX2lZdqroMMjdhfFB_tk2hpoXITm76Ova2jkkYOyU16_bJRaXSb7lU9v6SbmUVUvA-nH15JFD9uNZ7Jj8TmW63KjXWSqPwarVQSaGEfTNqH_c5dAkuXucfdRP9ZS26NhtDMGSWNF2zJub7SGC2Th1OcIrd1DsX2HNvk-SNAOMMQvRehaedm7xSMuCxJvFg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDdaiSEGwKgEQKSa0zVyqa1MOufsYEMG5n3bJfdR_3IP0HFeiHOgyfUq8FXEHH4xEYXy1ex5Z8Zcwq9gLWhlHCc8UcMUyrmixdQPR67YEweTGLydMDk2gn8hv7Czgd3EPZp27FN67s_ZpxGtvvjTTwJWhbb2jthdbMrg3r2yZnRjocW1gAR3iO6Z_MM7-by9b7HmHxyMcORiL1Sfvt6NrhHUp4swqLRfxd4xUYBd1A1FZrTMp55t4eqfg',
];

const DEFAULT_LOUNGE_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBr-PEhknluR3U5ZxZSQVN215jF8nIDoib8TqvEE6wEdFYmPoKLvd7zdftAZXhSd30fhnoEz0lnIbkDa3C825hFSkUYui5dlfyZaqnLRhihj6KbjBpNPBAPpjN0XY1X1ZcbbKC37agTtuMTK0RhYjRLRao3ie8vnrzfm02kZPe12pu6ro1uVGmoFIvXelNWnM8RH17U_AoyJwL-lhyYvM2kWMnDXesagLCZc6NgQaG5-weyoS2CI6i_9w';

const DEFAULT_VIP_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB6mjjWNkLxHsdoFa4-6ySTHYf1InNUWssex9OeZfi3cMnOAEliJu_exu4MFK49fvvalvxuFuYY0jel4uaN7h778nO5WMaQTa1BCTzZn3e4wGrSd7GsgTKJ-WWw87WBdPGv6Zm0NlUJhrJMtTnDFMz1LBQvgQ8gceUFPZmWfoBDVhecp2n_rBnOvxuujPE9kFcF7XMhZhW3zaWtAqCrd9HuDpWh28bVDvw4WirTRMwZmYubGgfMJfG5mA';

const DEFAULT_HERO_BG =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw';

// Helper to generate the exact recipi/id/title URL format
export const getRecipeUrl = (dish: { id: number; name: string }) => {
    const slug = dish.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `/recipi/${dish.id}/${slug || 'dish'}`;
};

// Helper to parse line-by-line operating hours from AppSettings
export const parseOpeningHours = (hoursStr?: string) => {
    if (!hoursStr) {
        return [
            { day: 'Saturday - Wednesday', hours: '8:00 PM - 4:00 AM', isPeak: false },
            { day: 'Thursday - Friday (Peak Nights)', hours: '8:00 PM - 6:00 AM', isPeak: true },
        ];
    }

    const lines = hoursStr.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return lines.map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
            const dayPart = line.substring(0, colonIdx).trim();
            const hourPart = line.substring(colonIdx + 1).trim();
            const isPeak =
                dayPart.toLowerCase().includes('peak') ||
                dayPart.toLowerCase().includes('weekend') ||
                dayPart.toLowerCase().includes('fri') ||
                dayPart.toLowerCase().includes('thu');
            return { day: dayPart, hours: hourPart, isPeak };
        }
        return { day: line.trim(), hours: '', isPeak: false };
    });
};

export default function Welcome({ settings, menuCategories, featuredItems, reviews = [] }: Props) {
    const [activeTab, setActiveTab] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize AOS (Animate On Scroll)
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
                duration: 750,
                easing: 'ease-out-cubic',
                once: true,
                offset: 60,
            });
            (window as any).AOS.refresh();
        }
    }, [activeTab, searchQuery]);

    // Initialize Swiper.js for Reviews Carousel
    useEffect(() => {
        let swiperInstance: any = null;
        if (typeof window !== 'undefined' && (window as any).Swiper) {
            swiperInstance = new (window as any).Swiper('.reviews-swiper', {
                slidesPerView: 1,
                spaceBetween: 24,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 24,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                },
            });
        }
        return () => {
            if (swiperInstance && swiperInstance.destroy) {
                swiperInstance.destroy(true, true);
            }
        };
    }, [reviews]);

    // Format Order Link using WhatsApp (if enabled) or Voice Phone Call
    const isWhatsAppEnabled = settings.enable_whatsapp !== false;
    const targetPhone = isWhatsAppEnabled
        ? settings.whatsapp_number || settings.phone || '+8801700000000'
        : settings.phone || '+8801700000000';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    const generateOrderLink = (dishName?: string) => {
        if (!isWhatsAppEnabled) {
            return `tel:${cleanPhone}`;
        }
        const text = dishName
            ? `Hello ${settings.brand_name}, I would like to order: ${dishName}`
            : `Hello ${settings.brand_name}, I have an inquiry about reservations and late-night delivery.`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    };

    // Filter menu items by search and category
    const allDishes = menuCategories.flatMap((cat) => cat.menu_items);
    const filteredDishes = (activeTab === 'all' ? allDishes : (menuCategories.find((c) => c.id === activeTab)?.menu_items ?? [])).filter(
        (dish) =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Limit to latest 15 dishes on landing page
    const displayedDishes = filteredDishes.slice(0, 15);

    // Dynamic dish image helper
    const getDishImage = (dish: MenuItem, index: number) => {
        if (dish.image_path) return dish.image_path;
        return DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length];
    };

    const brandLogoImage = settings.brand_logo || settings.logo_url;
    const heroBgImage = settings.hero_bg_image || DEFAULT_HERO_BG;
    const atmosphereImage = settings.atmosphere_image || DEFAULT_LOUNGE_IMAGE;
    const vipLoungeImage = settings.vip_lounge_image || DEFAULT_VIP_IMAGE;

    // JSON-LD Structured Data for Restaurant SEO
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: settings.brand_name,
        image: brandLogoImage || heroBgImage,
        telephone: settings.phone,
        email: settings.email,
        address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressLocality: 'Dhaka',
            addressCountry: 'BD',
        },
        servesCuisine: ['Fast Food', 'Gourmet Burgers', 'Artisan Pizza', 'Late Night Dining'],
        priceRange: '$$',
        openingHours: 'Mo-Su 20:00-04:00',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://restaurant.test',
        menu: typeof window !== 'undefined' ? `${window.location.origin}/recipes` : 'https://restaurant.test/recipes',
        acceptsReservations: 'True',
    };

    return (
        <SurfaceLayout settings={settings}>
            {/* Rich SEO Meta Tags & JSON-LD Structured Data */}
            <Head>
                <title>{`${settings.brand_name} - ${settings.tagline} | Late Night Gourmet Experience`}</title>
                <meta
                    name="description"
                    content={`${settings.brand_name}: ${settings.tagline}. Premium fast food and artisanal dining for the late-night elite. Freshly delivered hot, fast, and exquisite.`}
                />
                <meta
                    name="keywords"
                    content={`${settings.brand_name}, late night food, gourmet burger, pizza, artisan cuisine, fast delivery, midnight restaurant, dining`}
                />
                <meta name="author" content={settings.brand_name} />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={`${settings.brand_name} - ${settings.tagline}`} />
                <meta
                    property="og:description"
                    content={`Premium late-night gourmet food delivered hot & fast. Explore our full lineup and chef's exclusives at ${settings.brand_name}.`}
                />
                <meta property="og:type" content="restaurant.restaurant" />
                <meta property="og:image" content={brandLogoImage || heroBgImage} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${settings.brand_name} - ${settings.tagline}`} />
                <meta
                    name="twitter:description"
                    content="Gourmet fast food for the late-night elite. Savor artisanal burgers, crispy sides, and midnight exclusives."
                />
                <meta name="twitter:image" content={brandLogoImage || heroBgImage} />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Head>

            {/* Hero Section */}
            <SurfaceHero
                settings={settings}
                heroBgImage={heroBgImage}
                generateOrderLink={generateOrderLink}
                isWhatsAppEnabled={isWhatsAppEnabled}
            />

            {/* The After-Hours Atmosphere Section */}
            <section id="atmosphere" className="py-20 sm:py-24 relative overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
                        <div className="space-y-6" data-aos="fade-right">
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                                <Sparkles className="h-3.5 w-3.5" /> The Nocturnal Vibe
                            </div>
                            <h2 className="font-montserrat text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                                The After-Hours Atmosphere
                            </h2>
                            <p className="font-inter text-base text-slate-700 leading-relaxed dark:text-[#e5e2e1]/85">
                                Step into a world where culinary excellence meets nightlife seduction. {settings.brand_name} isn't just a
                                meal; it's a sensory experience designed for those who thrive when the sun goes down.
                            </p>
                            <p className="font-inter text-sm text-slate-600 leading-relaxed dark:text-[#e5e2e1]/70">
                                Our atmospheric lounges blend pulsating beats with intimate lighting, creating the perfect backdrop for savoring
                                gourmet flavors. Whether you're fueling a late-night endeavor or unwinding after hours, we provide an escape from the ordinary.
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/recipes"
                                    className="inline-flex items-center gap-2 font-montserrat text-sm font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 group"
                                >
                                    <span>Explore The Full Menu & Recipes</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>

                        {/* Atmosphere Image Glass Panel */}
                        <div
                            className="h-72 sm:h-96 lg:h-[460px] relative rounded-2xl overflow-hidden glass-panel group shadow-xl border border-slate-200/90 dark:border-white/10"
                            data-aos="fade-left"
                        >
                            <img
                                src={atmosphereImage}
                                alt="Moody late-night restaurant and lounge ambiance"
                                className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
                                <p className="font-montserrat text-xs font-bold uppercase tracking-wider text-orange-400">Exclusive Dining Lounge</p>
                                <p className="text-xs text-slate-200 mt-1">Immersive soundscapes, craft mocktails, and freshly prepared dishes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Lineup Section (Latest 15 Items + View All Recipes CTA) */}
            <section id="lineup" className="py-20 sm:py-24 bg-slate-100/90 dark:bg-[#131313] transition-colors border-y border-slate-200/90 dark:border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6" data-aos="fade-up">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                                Midnight Culinary Selection
                            </span>
                            <h2 className="font-montserrat text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e] mt-2">
                                The Lineup
                            </h2>
                            <p className="font-inter text-sm text-slate-700 dark:text-[#e5e2e1]/80 mt-2 max-w-xl">
                                Featured late-night creations. Showing latest 15 dishes — click any card to explore its recipe story.
                            </p>
                        </div>

                        {/* Search & All Recipes Link */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search creations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-full border border-slate-300 bg-white py-3 pr-4 pl-11 text-xs text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:outline-none dark:border-white/15 dark:bg-[#1c1b1b] dark:text-slate-100"
                                />
                            </div>
                            <Link
                                href="/recipes"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 font-montserrat text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>View All</span>
                            </Link>
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none flex-wrap" data-aos="fade-up" data-aos-delay="100">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`rounded-full px-5 py-2.5 font-montserrat text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${activeTab === 'all'
                                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25 neon-glow'
                                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:border-orange-400 dark:border-white/10 dark:bg-[#1c1b1b] dark:text-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            All Featured ({allDishes.length})
                        </button>
                        {menuCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`rounded-full px-5 py-2.5 font-montserrat text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${activeTab === cat.id
                                        ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25 neon-glow'
                                        : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:border-orange-400 dark:border-white/10 dark:bg-[#1c1b1b] dark:text-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat.name} ({cat.menu_items.length})
                            </button>
                        ))}
                    </div>

                    {/* Dish Cards Grid (15 items max) */}
                    {displayedDishes.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center dark:border-white/10 dark:bg-[#1c1b1b]" data-aos="fade-up">
                            <Utensils className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
                            <p className="font-montserrat font-bold text-slate-800 dark:text-slate-200">No dishes match your query.</p>
                            <p className="font-inter text-xs text-slate-600 dark:text-slate-400 mt-1">Try another search keyword or clear filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {displayedDishes.map((dish, idx) => (
                                <Link
                                    key={dish.id}
                                    href={getRecipeUrl(dish)}
                                    data-aos="fade-up"
                                    data-aos-delay={(idx % 3) * 100}
                                    className="glass-panel rounded-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between shadow-md hover:shadow-2xl hover:border-orange-500/60 border border-slate-200/90 dark:border-white/10 cursor-pointer"
                                >
                                    <div>
                                        {/* Dish Image with Price and Badges */}
                                        <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-900">
                                            <img
                                                src={getDishImage(dish, idx)}
                                                alt={dish.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                                            {/* Price Badge */}
                                            <div className="absolute top-4 right-4 z-20 rounded-full bg-orange-600/95 backdrop-blur-md px-3.5 py-1.5 font-montserrat text-xs font-extrabold text-white shadow-lg">
                                                {formatCurrency(dish.price, settings.default_currency)}
                                            </div>

                                            {/* Category Tag */}
                                            <div className="absolute top-4 left-4 z-20 rounded-full bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 font-montserrat text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                                                {dish.category?.name ?? 'Signature'}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <h3 className="font-montserrat text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors dark:text-slate-100 dark:group-hover:text-orange-400 block">
                                                {dish.name}
                                            </h3>
                                            <p className="font-inter text-xs text-slate-700 mt-2 line-clamp-2 leading-relaxed dark:text-[#e5e2e1]/75">
                                                {dish.description?.replace(/<[^>]*>?/gm, '') || 'Artisan culinary dish crafted with freshest seasonal ingredients.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                                        <span className="inline-flex items-center gap-1.5 font-montserrat text-xs font-bold text-orange-600 group-hover:text-orange-700 dark:text-orange-400 dark:group-hover:text-orange-300 uppercase tracking-wider">
                                            <ChefHat className="h-3.5 w-3.5" />
                                            <span>View Recipe →</span>
                                        </span>

                                        <a
                                            href={generateOrderLink(dish.name)}
                                            target={isWhatsAppEnabled ? '_blank' : undefined}
                                            rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 font-montserrat text-xs font-bold text-white shadow transition-all hover:bg-emerald-500 active:scale-95 z-20 relative"
                                        >
                                            {isWhatsAppEnabled ? (
                                                <MessageCircle className="h-3.5 w-3.5" />
                                            ) : (
                                                <Phone className="h-3.5 w-3.5" />
                                            )}
                                            <span>{isWhatsAppEnabled ? 'Order' : 'Call'}</span>
                                        </a>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* View All Recipes CTA Banner */}
                    <div className="mt-14 text-center" data-aos="fade-up">
                        <Link
                            href="/recipes"
                            className="inline-flex items-center gap-3 rounded-full bg-slate-900 text-white dark:bg-white/10 dark:hover:bg-white/15 px-8 py-4 font-montserrat text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all border border-slate-800 dark:border-white/20 hover:scale-105 active:scale-95"
                        >
                            <BookOpen className="h-4 w-4 text-orange-500" />
                            <span>Browse All Recipes & Master Catalogue ({allDishes.length} Items)</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Chef's Specials Bento Grid Section */}
            {featuredItems.length > 0 && (
                <section id="specials" className="py-20 sm:py-24 bg-white dark:bg-[#0a0a0a] transition-colors">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2" data-aos="fade-up">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                                Curated Masterpieces
                            </span>
                            <h2 className="font-montserrat text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                                Chef's Exclusives
                            </h2>
                            <p className="font-inter text-sm text-slate-700 dark:text-[#e5e2e1]/80">
                                Seasonal, limited-run creations crafted for the true nocturnal connoisseur.
                            </p>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredItems.map((dish, idx) => (
                                <Link
                                    key={dish.id}
                                    href={getRecipeUrl(dish)}
                                    data-aos="zoom-in"
                                    data-aos-delay={idx * 120}
                                    className={`relative h-72 sm:h-80 rounded-2xl overflow-hidden group shadow-lg ${idx === 2 ? 'sm:col-span-2' : ''
                                        }`}
                                >
                                    <img
                                        src={getDishImage(dish, idx + 3)}
                                        alt={dish.name}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent"></div>

                                    {/* Top badges */}
                                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                        <span className="rounded-full bg-orange-600 px-3 py-1 font-montserrat text-[10px] font-extrabold uppercase tracking-widest text-white shadow">
                                            {idx === 0 ? 'Chef Signature' : idx === 1 ? 'Limited Cut' : 'Exclusive'}
                                        </span>
                                    </div>

                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 font-montserrat text-xs font-bold text-amber-300 border border-white/15">
                                            {formatCurrency(dish.price, settings.default_currency)}
                                        </span>
                                    </div>

                                    {/* Bottom Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                        <h3 className="font-montserrat text-xl font-extrabold text-white group-hover:text-orange-400 transition-colors">
                                            {dish.name}
                                        </h3>
                                        <p className="font-inter text-xs text-slate-200 mt-2 line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                            {dish.description?.replace(/<[^>]*>?/gm, '') || 'Exclusive culinary creation prepared by our executive chefs.'}
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                                            <span>Click to View Full Recipe</span>
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* LIVE KITCHEN RADAR & DISPATCH COMMAND */}
            <section id="tracker" className="py-20 sm:py-24 relative overflow-hidden bg-slate-100 dark:bg-[#0c0c0c] border-y border-slate-200/90 dark:border-white/5 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-14 space-y-3" data-aos="fade-up">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-1.5 backdrop-blur-md">
                            <Radio className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                            <span className="font-montserrat text-xs font-bold uppercase tracking-widest text-orange-900 dark:text-orange-300">
                                Live Kitchen Radar & Telemetry
                            </span>
                        </div>
                        <h2 className="font-montserrat text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                            Heat Network Active
                        </h2>
                        <p className="font-inter text-sm text-slate-700 dark:text-[#e5e2e1]/80 max-w-xl mx-auto">
                            Precision thermal routing, high-velocity grill stations, and real-time courier synchronization across midnight districts.
                        </p>
                    </div>

                    {/* Live Metric Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-aos="fade-up" data-aos-delay="100">
                        <div className="glass-panel p-5 rounded-2xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                            <Zap className="h-5 w-5 mx-auto text-orange-500" />
                            <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Midnight Dispatch</p>
                            <p className="font-montserrat text-lg font-extrabold text-slate-900 dark:text-slate-100">12 - 15 Mins</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                            <Flame className="h-5 w-5 mx-auto text-orange-500 fill-current" />
                            <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Sear Temperature</p>
                            <p className="font-montserrat text-lg font-extrabold text-slate-900 dark:text-slate-100">380°C Searing</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                            <Navigation className="h-5 w-5 mx-auto text-orange-500" />
                            <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Express Radius</p>
                            <p className="font-montserrat text-lg font-extrabold text-slate-900 dark:text-slate-100">8.5 KM Zone</p>
                        </div>
                        <div className="glass-panel p-5 rounded-2xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                            <Thermometer className="h-5 w-5 mx-auto text-orange-500" />
                            <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Thermal Seal</p>
                            <p className="font-montserrat text-lg font-extrabold text-slate-900 dark:text-slate-100">100% Heat Lock</p>
                        </div>
                    </div>

                    {/* Dashboard 2-Column Showcase */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* Left: Active Live Orders Ticker (5 cols) */}
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between" data-aos="fade-right" data-aos-delay="150">
                            <div className="glass-panel p-6 rounded-2xl shadow-md border border-slate-200/90 dark:border-white/10 space-y-4 h-full flex flex-col justify-between">
                                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                                    <h3 className="font-montserrat text-xs font-extrabold uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-orange-500" /> Live Kitchen Orders Queue
                                    </h3>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live Sync
                                    </span>
                                </div>

                                {/* Order Item 1 */}
                                <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-montserrat text-xs font-bold text-slate-900 dark:text-white">Order #8892 • Wagyu Burger Melt</span>
                                        <span className="rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 px-2 py-0.5 font-montserrat text-[10px] font-extrabold uppercase">
                                            En Route
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[78%] rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                                        <span>Courier assigned: Bike #04</span>
                                        <span className="font-bold text-orange-600 dark:text-orange-400">Est. 6 mins remaining</span>
                                    </div>
                                </div>

                                {/* Order Item 2 */}
                                <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-montserrat text-xs font-bold text-slate-900 dark:text-white">Order #8895 • Truffle Artisan Pizza</span>
                                        <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 font-montserrat text-[10px] font-extrabold uppercase">
                                            Oven Firing
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full w-[45%] rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                                        <span>Station: Brick Oven #02</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Baking at 400°C</span>
                                    </div>
                                </div>

                                {/* Order Item 3 */}
                                <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="font-montserrat text-xs font-bold text-slate-900 dark:text-white">Order #8899 • Double Smash Combo</span>
                                        <span className="rounded-full bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-300 px-2 py-0.5 font-montserrat text-[10px] font-extrabold uppercase">
                                            Plating
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[92%] rounded-full"></div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                                        <span>Thermal Boxing Stage</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready for pickup</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Immersive Interactive Radar Canvas (7 cols) */}
                        <div
                            className="lg:col-span-7 min-h-[380px] bg-slate-950 rounded-2xl border border-slate-800 dark:border-white/10 p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl text-white"
                            data-aos="fade-left"
                            data-aos-delay="150"
                        >
                            {/* Grid Overlay */}
                            <div
                                className="absolute inset-0 opacity-20 pointer-events-none"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, #ff571a 1px, transparent 1px), linear-gradient(to bottom, #ff571a 1px, transparent 1px)',
                                    backgroundSize: '36px 36px',
                                }}
                            ></div>

                            {/* Radar Scan Rings */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 rounded-full border border-orange-500/25 animate-ping opacity-30"></div>
                                <div className="w-96 h-96 rounded-full border border-orange-500/15"></div>
                                <div className="w-40 h-40 rounded-full border border-orange-500/35"></div>
                            </div>

                            {/* Top HUD */}
                            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500 tracker-pulse"></span>
                                    <span className="font-montserrat text-xs font-extrabold uppercase text-orange-400 tracking-wider">
                                        Midnight Dispatch Sector Grid
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">SYS_V2.6 // SECURE</span>
                            </div>

                            {/* Hotspot Beacons on Radar */}
                            <div className="relative z-10 my-8 grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                        <Bike className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-montserrat text-xs font-bold text-white">Downtown Sector</p>
                                        <p className="text-[10px] text-orange-400 font-semibold">4 Active Couriers • Avg. 8m</p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                        <Bike className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-montserrat text-xs font-bold text-white">Midtown & Lakes</p>
                                        <p className="text-[10px] text-orange-400 font-semibold">6 Active Couriers • Avg. 11m</p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                        <Bike className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-montserrat text-xs font-bold text-white">Uptown North</p>
                                        <p className="text-[10px] text-orange-400 font-semibold">3 Active Couriers • Avg. 14m</p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Flame className="h-4 w-4 fill-current" />
                                    </div>
                                    <div>
                                        <p className="font-montserrat text-xs font-bold text-white">Central Hub (Kitchen)</p>
                                        <p className="text-[10px] text-emerald-400 font-semibold">Optimal Kitchen Flow</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom CTA on Radar */}
                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                                <span className="text-xs text-slate-300">Live order delivery tracking active on all orders.</span>
                                <a
                                    href={generateOrderLink('Kitchen Status & Order Tracking')}
                                    target={isWhatsAppEnabled ? '_blank' : undefined}
                                    rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                                    className="inline-flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-500 px-4 py-2 font-montserrat text-xs font-bold text-white transition-all shadow"
                                >
                                    <span>{isWhatsAppEnabled ? 'Track or Order via WhatsApp' : 'Call Kitchen Hotline'}</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us / Pillars of Excellence */}
            <section className="py-20 sm:py-24 bg-white dark:bg-[#0a0a0a] transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 text-center">
                        {/* Pillar 1 */}
                        <div
                            className="flex flex-col items-center group p-6 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                            data-aos="fade-up"
                            data-aos-delay="0"
                        >
                            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-white/5 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 neon-glow group-hover:scale-110 transition-transform">
                                <Clock className="h-8 w-8" />
                            </div>
                            <h3 className="font-montserrat text-xl font-extrabold uppercase text-slate-900 dark:text-slate-100 mb-2">
                                24/7 Delivery
                            </h3>
                            <p className="font-inter text-xs sm:text-sm text-slate-700 dark:text-[#e5e2e1]/75 leading-relaxed max-w-xs">
                                We own the night. When late cravings hit, our express delivery network operates without hesitation.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div
                            className="flex flex-col items-center group p-6 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                            data-aos="fade-up"
                            data-aos-delay="150"
                        >
                            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-white/5 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 neon-glow group-hover:scale-110 transition-transform">
                                <Award className="h-8 w-8" />
                            </div>
                            <h3 className="font-montserrat text-xl font-extrabold uppercase text-slate-900 dark:text-slate-100 mb-2">
                                Gourmet Ingredients
                            </h3>
                            <p className="font-inter text-xs sm:text-sm text-slate-700 dark:text-[#e5e2e1]/75 leading-relaxed max-w-xs">
                                No shortcuts. Only prime cuts, artisan brioche buns, and fresh produce sourced with extreme care.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div
                            className="flex flex-col items-center group p-6 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                            data-aos="fade-up"
                            data-aos-delay="300"
                        >
                            <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-white/5 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 neon-glow group-hover:scale-110 transition-transform">
                                <Bolt className="h-8 w-8" />
                            </div>
                            <h3 className="font-montserrat text-xl font-extrabold uppercase text-slate-900 dark:text-slate-100 mb-2">
                                Neon Speed
                            </h3>
                            <p className="font-inter text-xs sm:text-sm text-slate-700 dark:text-[#e5e2e1]/75 leading-relaxed max-w-xs">
                                Precision-optimized kitchen stations ensure your food arrives rapidly while maintaining peak heat.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Lounge Membership / Elite Syndicate Section */}
            <section className="py-28 sm:py-32 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={vipLoungeImage}
                        alt="Luxury restaurant VIP dining lounge"
                        className="h-full w-full object-cover filter brightness-40"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div
                        className="p-8 sm:p-14 rounded-3xl text-center shadow-2xl space-y-6 text-white"
                        data-aos="zoom-in"
                    >
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 mx-auto">
                            <Diamond className="h-8 w-8" />
                        </div>
                        <h2 className="font-montserrat text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-md">
                            The Elite Syndicate
                        </h2>
                        <p className="font-inter text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
                            Unlock the inner circle. Members receive priority routing on late-night orders, exclusive access to off-menu chef
                            recipes, and reserved physical lounge table reservations.
                        </p>
                        <div className="pt-2">
                            <a
                                href={generateOrderLink('VIP Membership & Table Reservation')}
                                target={isWhatsAppEnabled ? '_blank' : undefined}
                                rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                                className="inline-flex items-center gap-2 rounded-full border-2 border-orange-500 px-8 py-3.5 font-montserrat text-xs font-extrabold uppercase tracking-widest text-orange-400 hover:bg-orange-500 hover:text-white transition-all active:scale-95 neon-glow-hover"
                            >
                                <span>{isWhatsAppEnabled ? 'Join The Elite / Reserve Table' : 'Call Lounge For Table Reservation'}</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials with Swiper Slider (The Word on the Street) */}
            <section id="reviews" className="py-20 sm:py-24 bg-slate-100/90 dark:bg-[#131313] transition-colors border-y border-slate-200/90 dark:border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14 space-y-2" data-aos="fade-up">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                            Verified Guest Experiences
                        </span>
                        <h2 className="font-montserrat text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                            The Word on the Street
                        </h2>
                        <p className="font-inter text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Real reviews from our night-owl food connoisseurs and midnight diners.
                        </p>
                    </div>

                    {/* Swiper Container */}
                    <div className="relative pb-10" data-aos="fade-up">
                        <div className="swiper reviews-swiper">
                            <div className="swiper-wrapper">
                                {reviews.map((rev, i) => (
                                    <div key={rev.id ?? i} className="swiper-slide h-auto">
                                        <div className="glass-panel p-8 rounded-2xl relative shadow-md border border-slate-200/90 dark:border-white/10 h-full flex flex-col justify-between">
                                            <div>
                                                <Quote className="absolute top-6 right-6 h-8 w-8 text-orange-500/20" />

                                                {/* Star Rating Display (5 or 4 stars) */}
                                                <div className="flex items-center gap-1 text-amber-500 mb-4">
                                                    {[...Array(5)].map((_, starIdx) => (
                                                        <Star
                                                            key={starIdx}
                                                            className={`h-4 w-4 ${starIdx < rev.rating
                                                                    ? 'fill-current text-amber-500'
                                                                    : 'text-slate-300 dark:text-slate-700'
                                                                }`}
                                                        />
                                                    ))}
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                                                        {rev.rating}.0
                                                    </span>
                                                </div>

                                                <p className="font-inter text-sm italic text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
                                                    "{rev.comment}"
                                                </p>
                                            </div>

                                            {/* Customer Signature */}
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200/80 dark:border-white/5">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                                                    {rev.avatar_initials || rev.customer_name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-montserrat text-xs font-bold text-slate-900 dark:text-slate-100">
                                                        {rev.customer_name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                                        {rev.customer_title || 'Verified Diner • Night Owl'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="swiper-pagination !-bottom-1"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location & Hours Section (Find the Fire) */}
            <section id="locations" className="py-20 sm:py-24 bg-white dark:bg-[#0a0a0a] transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch">
                        {/* Info Column */}
                        <div
                            className="space-y-6 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-white/10 flex flex-col justify-between shadow-md"
                            data-aos="fade-right"
                        >
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                                    <MapPin className="h-3.5 w-3.5" /> Physical Lounge
                                </div>
                                <h2 className="font-montserrat text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                                    Find the Fire
                                </h2>

                                <div className="space-y-2">
                                    <h3 className="font-montserrat text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                        Flagship Lounge Address
                                    </h3>
                                    <p className="font-inter text-xs sm:text-sm text-slate-700 dark:text-[#e5e2e1]/85 leading-relaxed">
                                        {settings.address}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-montserrat text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                                        Operating Hours
                                    </h3>
                                    <ul className="font-inter text-xs sm:text-sm text-slate-700 dark:text-[#e5e2e1]/85 space-y-2">
                                        {parseOpeningHours(settings.opening_hours).map((schedule, idx, arr) => (
                                            <li
                                                key={idx}
                                                className={`flex justify-between ${idx < arr.length - 1 ? 'border-b border-slate-200/80 dark:border-white/5 pb-1' : 'pb-1'
                                                    } ${schedule.isPeak ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}`}
                                            >
                                                <span>{schedule.day}</span>
                                                <span className={schedule.isPeak ? 'font-bold' : 'font-bold text-slate-900 dark:text-slate-100'}>
                                                    {schedule.hours}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-4">
                                <a
                                    href={generateOrderLink('Location Directions & Inquiries')}
                                    target={isWhatsAppEnabled ? '_blank' : undefined}
                                    rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 py-3.5 font-montserrat text-xs font-bold uppercase text-slate-800 hover:bg-slate-200 transition-all dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                                >
                                    <Compass className="h-4 w-4 text-orange-500" />
                                    <span>Get Directions & Help</span>
                                </a>
                            </div>
                        </div>

                        {/* Map Embed or Stylized Map Canvas */}
                        <div
                            className="lg:col-span-2 min-h-[420px] h-full rounded-2xl overflow-hidden glass-panel relative shadow-xl border border-slate-200/90 dark:border-white/10 flex flex-col [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:min-h-[420px] [&_iframe]:border-0 [&_iframe]:flex-1"
                            data-aos="fade-left"
                        >
                            {settings.google_maps_embed ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: settings.google_maps_embed.replace(/<iframe/i, '<iframe loading="lazy"'),
                                    }}
                                    className="w-full h-full flex-1 min-h-[420px]"
                                />
                            ) : (
                                <div className="w-full h-full min-h-[420px] flex-1 bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-15"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, #ff571a 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                        }}
                                    ></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 tracker-pulse">
                                            <Flame className="h-7 w-7 fill-current" />
                                        </div>
                                        <h4 className="font-montserrat text-lg font-bold text-white uppercase">{settings.brand_name} HQ</h4>
                                        <p className="text-xs text-slate-300 mt-1 max-w-sm">{settings.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Order CTA Section */}
            <section className="py-24 sm:py-28 relative overflow-hidden bg-slate-900 text-center">
                <div className="absolute inset-0 z-0 opacity-25">
                    <img
                        src={heroBgImage}
                        alt="Artisan burger textures"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>

                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="zoom-in">
                    <h2 className="font-montserrat text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-tight">
                        Ready to Ignite <br />
                        <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Your Tastebuds?
                        </span>
                    </h2>
                    <p className="font-inter text-sm sm:text-base text-slate-200 max-w-xl mx-auto">
                        The kitchen is firing at full capacity. Fresh ingredients, exquisite flavors, and midnight speeds await.
                    </p>
                    <div className="pt-4 flex flex-wrap justify-center gap-4">
                        <a
                            href={generateOrderLink()}
                            target={isWhatsAppEnabled ? '_blank' : undefined}
                            rel={isWhatsAppEnabled ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-8 sm:px-10 py-4 sm:py-5 font-montserrat text-sm font-extrabold uppercase tracking-wider text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 neon-glow text-center"
                        >
                            {isWhatsAppEnabled ? (
                                <Flame className="h-5 w-5 fill-current" />
                            ) : (
                                <Phone className="h-5 w-5" />
                            )}
                            <span>{isWhatsAppEnabled ? 'Order Now On WhatsApp' : 'Call Kitchen Hotline'}</span>
                        </a>
                        <Link
                            href="/recipes"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-8 sm:px-10 py-4 sm:py-5 font-montserrat text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all active:scale-95 text-center"
                        >
                            <BookOpen className="h-5 w-5 text-orange-400" />
                            <span>View All Recipes</span>
                        </Link>
                    </div>
                </div>
            </section>
        </SurfaceLayout>
    );
}
