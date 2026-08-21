import { useAppearance } from '@/hooks/use-appearance';
import { formatCurrency } from '@/lib/swal';
import { Head, Link } from '@inertiajs/react';
import { Award, Clock, Facebook, Instagram, MapPin, MessageCircle, Moon, Phone, Search, Shield, Star, Sun, Twitter, Utensils } from 'lucide-react';
import { useState } from 'react';

interface Settings {
    brand_name: string;
    brand_logo?: string;
    brand_icon?: string;
    tagline: string;
    about_text: string;
    phone: string;
    email: string;
    address: string;
    opening_hours: string;
    logo_url?: string;
    default_currency: string;
    google_maps_embed: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    terms_conditions: string;
    privacy_policy: string;
    footer_text: string;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image_path?: string;
    is_available: boolean;
    is_featured: boolean;
    category?: { name: string };
}

interface MenuCategory {
    id: number;
    name: string;
    description?: string;
    menu_items: MenuItem[];
}

interface Props {
    settings: Settings;
    menuCategories: MenuCategory[];
    featuredItems: MenuItem[];
}

export default function Welcome({ settings, menuCategories, featuredItems }: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const [activeTab, setActiveTab] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const isDarkMode = appearance === 'dark';

    // Format WhatsApp Link
    const cleanPhone = settings.phone.replace(/[^0-9]/g, '');
    const generateWhatsAppLink = (dishName?: string) => {
        const text = dishName
            ? `Hello ${settings.brand_name}, I would like to order: ${dishName}`
            : `Hello ${settings.brand_name}, I have an inquiry about reservations and menu.`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    };

    // Filter menu items by search and category
    const allDishes = menuCategories.flatMap((cat) => cat.menu_items);
    const filteredDishes = (activeTab === 'all' ? allDishes : (menuCategories.find((c) => c.id === activeTab)?.menu_items ?? [])).filter(
        (dish) => dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || dish.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
            <Head title={`${settings.brand_name} - ${settings.tagline}`} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all dark:border-slate-800/60 dark:bg-slate-950/80">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        {settings.brand_logo ? (
                            <img src={settings.brand_logo} alt={settings.brand_name} className="h-10 w-auto object-contain" />
                        ) : settings.brand_icon ? (
                            <img src={settings.brand_icon} alt={settings.brand_name} className="h-10 w-10 rounded-xl object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20">
                                <Utensils className="h-6 w-6" />
                            </div>
                        )}
                        <div>
                            <span className="font-display bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-amber-200 dark:via-amber-400 dark:to-orange-400">
                                {settings.brand_name}
                            </span>
                            <p className="hidden font-sans text-xs text-slate-500 sm:block dark:text-slate-400">{settings.tagline}</p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-8 font-sans text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
                        <a href="#about" className="transition-colors hover:text-amber-500">
                            About Us
                        </a>
                        <a href="#menu" className="transition-colors hover:text-amber-500">
                            Digital Menu
                        </a>
                        <a href="#featured" className="transition-colors hover:text-amber-500">
                            Specials
                        </a>
                        <a href="#contact" className="transition-colors hover:text-amber-500">
                            Contact
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Light / Dark Mode Toggle */}
                        <button
                            onClick={() => updateAppearance(isDarkMode ? 'light' : 'dark')}
                            className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 transition-all hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="Toggle Light / Dark theme"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
                        </button>

                        <a
                            href={generateWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 hover:bg-emerald-500 active:scale-95"
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp Us</span>
                        </a>
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                            Admin Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Banner Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-100 to-slate-50 pt-12 pb-24 lg:pt-20 lg:pb-32 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl space-y-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 font-sans text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                <Award className="h-3.5 w-3.5" /> Culinary Excellence & Fresh Quality
                            </span>
                        </div>
                        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-slate-100">
                            Taste the Passion in Every{' '}
                            <span className="font-serif italic font-normal bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                                Artisan Bite
                            </span>
                        </h1>
                        <p className="font-sans text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">{settings.about_text}</p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-sans">
                            <a
                                href="#menu"
                                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 hover:from-amber-400 hover:to-orange-400 active:scale-95"
                            >
                                Explore Full Menu
                            </a>
                            <a
                                href={generateWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <MessageCircle className="h-4 w-4 text-emerald-500" />
                                Order via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Items Carousel / Grid */}
            {featuredItems.length > 0 && (
                <section id="featured" className="border-y border-slate-200 bg-slate-100/70 py-16 dark:border-slate-800/80 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <span className="font-script text-2xl text-amber-600 dark:text-amber-400">Handcrafted Specialties</span>
                                <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
                                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" /> Chef's Signature Specials
                                </h2>
                                <p className="font-culinary italic text-base text-slate-500 dark:text-slate-400">Our most celebrated dishes handcrafted with care</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredItems.map((dish) => (
                                <div
                                    key={dish.id}
                                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="space-y-4">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                                            {dish.image_path ? (
                                                <img
                                                    src={dish.image_path}
                                                    alt={dish.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-slate-600">
                                                    <Utensils className="h-12 w-12" />
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 rounded-full bg-amber-500 px-3 py-1 font-sans text-xs font-bold text-slate-950 shadow">
                                                Featured
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-amber-500 dark:text-slate-100">
                                                    {dish.name}
                                                </h3>
                                                <span className="font-sans text-lg font-extrabold text-amber-600 dark:text-amber-400">
                                                    {formatCurrency(dish.price, settings.default_currency)}
                                                </span>
                                            </div>
                                            <p className="mt-2 line-clamp-2 font-sans text-xs text-slate-500 dark:text-slate-400">
                                                {dish.description || 'Delicious gourmet chef preparation.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <Shield className="h-3.5 w-3.5" /> Freshly Prepared
                                        </span>
                                        <a
                                            href={generateWhatsAppLink(dish.name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-3.5 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white dark:text-emerald-300"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" /> Order Now
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Digital Menu Catalog */}
            <section id="menu" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
                    <span className="font-script text-2xl text-amber-600 dark:text-amber-400">Fresh Flavors & Daily Delights</span>
                    <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-slate-100">Interactive Digital Menu</h2>
                    <p className="font-culinary italic text-base sm:text-lg text-slate-500 dark:text-slate-400">Browse categories or search for your favorite gourmet dishes</p>

                    {/* Search Input */}
                    <div className="relative mx-auto max-w-md font-sans">
                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search dishes or ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-11 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-4 font-sans">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                activeTab === 'all'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            All Categories ({allDishes.length})
                        </button>
                        {menuCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                                    activeTab === cat.id
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                {cat.name} ({cat.menu_items.length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dish Grid */}
                {filteredDishes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
                        <Utensils className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
                        <p className="font-sans font-medium text-slate-500 dark:text-slate-400">No dishes found matching your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredDishes.map((dish) => (
                            <div
                                key={dish.id}
                                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-amber-500/50 dark:border-slate-800/80 dark:bg-slate-900"
                            >
                                <div>
                                    <div className="mb-2 flex items-start justify-between gap-4">
                                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">{dish.name}</h3>
                                        <span className="font-sans font-extrabold whitespace-nowrap text-amber-600 dark:text-amber-400">
                                            {formatCurrency(dish.price, settings.default_currency)}
                                        </span>
                                    </div>
                                    <p className="mb-4 font-sans text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        {dish.description || 'Artisan culinary dish prepared with fresh ingredients.'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
                                    <span className="font-sans font-medium text-slate-400 dark:text-slate-500">{dish.category?.name ?? 'General'}</span>
                                    <a
                                        href={generateWhatsAppLink(dish.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600/10 px-3 py-1.5 font-sans font-medium text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white dark:text-emerald-400"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" /> Order
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Testimonials Section */}
            <section className="border-t border-slate-200 bg-slate-100/50 py-20 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="font-script text-2xl text-amber-600 dark:text-amber-400">Guest Experience & Praise</span>
                        <h2 className="font-display mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-slate-100">Loved by Food Enthusiasts</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {[
                            {
                                name: 'Sarah Jenkins',
                                comment: 'The flavors at Le Gourmet Bistro are simply out of this world! Incredible Margherita pizza.',
                                rating: 5,
                            },
                            {
                                name: 'David Miller',
                                comment: 'Fast WhatsApp ordering and piping hot delivery. The gourmet chicken burger is a must-try!',
                                rating: 5,
                            },
                            {
                                name: 'Anita Roy',
                                comment: 'Top-tier ambiance and amazing quality ingredients. Hands down the best dining experience in town.',
                                rating: 5,
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-500" />
                                    ))}
                                </div>
                                <p className="font-serif text-sm italic leading-relaxed text-slate-600 dark:text-slate-300">"{item.comment}"</p>
                                <div className="border-t border-slate-200 pt-2 dark:border-slate-800/80">
                                    <p className="font-display text-xs font-bold text-slate-900 dark:text-slate-200">{item.name}</p>
                                    <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500">Verified Diner</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact & Map Section */}
            <section id="contact" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                        <span className="font-script text-2xl text-amber-600 dark:text-amber-400">Warm Hospitality</span>
                        <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-slate-100">Visit Us & Order Direct</h2>
                        <p className="font-sans text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            Have questions or want to make a group reservation? Reach out via WhatsApp or visit our location.
                        </p>

                        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                <div>
                                    <span className="font-display block font-bold text-slate-900 dark:text-slate-200">Location Address</span>
                                    <span className="font-sans text-xs text-slate-500 dark:text-slate-400">{settings.address}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                <div>
                                    <span className="font-display block font-bold text-slate-900 dark:text-slate-200">Opening Hours</span>
                                    <span className="font-sans text-xs text-slate-500 dark:text-slate-400">{settings.opening_hours}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                <div>
                                    <span className="font-display block font-bold text-slate-900 dark:text-slate-200">Phone & WhatsApp</span>
                                    <span className="font-sans text-xs text-slate-500 dark:text-slate-400">
                                        {settings.phone} ({settings.email})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <a
                                href={generateWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-sans text-sm font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-500"
                            >
                                <MessageCircle className="h-4 w-4" /> Direct WhatsApp Chat
                            </a>
                        </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        {settings.google_maps_embed ? (
                            <div
                                dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }}
                                className="h-80 w-full overflow-hidden rounded-xl"
                            />
                        ) : (
                            <div className="flex h-80 w-full items-center justify-center rounded-xl bg-slate-100 font-sans text-xs text-slate-400 dark:bg-slate-800">
                                <MapPin className="mx-auto mb-2 block h-8 w-8 text-slate-400" />
                                Google Maps Embed Placeholder
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-12 font-sans text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        {settings.brand_icon && (
                            <img src={settings.brand_icon} alt={settings.brand_name} className="h-8 w-8 rounded-lg object-contain" />
                        )}
                        <div>
                            <p className="font-display font-bold text-slate-700 dark:text-slate-300">{settings.brand_name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{settings.footer_text}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowTermsModal(true)} className="transition-colors hover:text-amber-500">
                            Terms & Conditions
                        </button>
                        <button onClick={() => setShowPrivacyModal(true)} className="transition-colors hover:text-amber-500">
                            Privacy Policy
                        </button>
                        <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="hover:text-amber-500">
                            <Facebook className="h-4 w-4" />
                        </a>
                        <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="hover:text-amber-500">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href={settings.social_twitter} target="_blank" rel="noreferrer" className="hover:text-amber-500">
                            <Twitter className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </footer>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Terms & Conditions</h3>
                        <div className="max-h-60 overflow-y-auto font-sans text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {settings.terms_conditions}
                        </div>
                        <div className="pt-2 text-right">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="rounded-xl bg-slate-100 px-4 py-2 font-sans text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h3>
                        <div className="max-h-60 overflow-y-auto font-sans text-xs leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {settings.privacy_policy}
                        </div>
                        <div className="pt-2 text-right">
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="rounded-xl bg-slate-100 px-4 py-2 font-sans text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
