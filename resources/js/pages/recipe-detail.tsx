import SurfaceLayout from '@/components/surface/surface-layout';
import { SurfaceSettings } from '@/components/surface/surface-header';
import { formatCurrency } from '@/lib/swal';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    ChefHat,
    Clock,
    CookingPot,
    Flame,
    Phone,
    Share2,
    Shield,
    Star,
    Thermometer,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface Props {
    item: MenuItem;
    relatedItems: MenuItem[];
    settings: SurfaceSettings;
}

const DEFAULT_RECIPE_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw';

// Helper to generate the exact recipi/id/title URL format
const getRecipeUrl = (dish: { id: number; name: string }) => {
    const slug = dish.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `/recipi/${dish.id}/${slug || 'dish'}`;
};

// Helper to decode HTML special characters / entities
function decodeHtmlEntities(rawText: string): string {
    if (!rawText) return '';
    if (typeof document !== 'undefined') {
        const doc = new DOMParser().parseFromString(rawText, 'text/html');
        return doc.documentElement.textContent || doc.body.innerHTML || rawText;
    }
    return rawText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

// Function to sanitize/prepare HTML content for display
function prepareHtmlContent(content?: string): string {
    if (!content) return '';
    if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&amp;')) {
        content = decodeHtmlEntities(content);
    }
    return content;
}

export default function RecipeDetail({ item, relatedItems, settings }: Props) {
    const [copied, setCopied] = useState(false);

    // Initialize AOS
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
                duration: 750,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50,
            });
            (window as any).AOS.refresh();
        }
    }, []);

    // Format WhatsApp Link for this specific dish
    const targetWhatsApp = settings.whatsapp_number || settings.phone || '+8801700000000';
    const cleanWhatsApp = targetWhatsApp.replace(/[^0-9]/g, '');
    const cleanVoicePhone = settings.phone.replace(/[^0-9]/g, '');

    const generateWhatsAppLink = (dishName?: string) => {
        const target = dishName || item.name;
        const text = `Hello ${settings.brand_name}, I would like to order the recipe: ${target} (${formatCurrency(item.price, settings.default_currency)})`;
        return `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(text)}`;
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const dishImage = item.image_path || DEFAULT_RECIPE_IMAGE;

    // Content for rich text rendering
    const recipeDescription = prepareHtmlContent(item.description);
    const recipeDetails = prepareHtmlContent(item.details);

    // Structured Data for Recipe SEO
    const recipeSchema = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: item.name,
        image: dishImage,
        description: item.description?.replace(/<[^>]*>?/gm, '') || `Gourmet recipe for ${item.name} prepared by ${settings.brand_name}.`,
        keywords: `${item.name}, gourmet recipe, ${item.category?.name || 'fast food'}, late night food`,
        author: {
            '@type': 'Organization',
            name: settings.brand_name,
        },
        recipeCategory: item.category?.name || 'Main Course',
        recipeCuisine: 'Artisan Fast Food / Gourmet',
        offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'BDT',
            availability: item.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: typeof window !== 'undefined' ? window.location.href : '',
        },
    };

    return (
        <SurfaceLayout
            settings={settings}
            isSubpage={true}
            backUrl="/#lineup"
            backLabel="Back To Menu"
            customOrderText={`${item.name} (${formatCurrency(item.price, settings.default_currency)})`}
        >
            {/* Rich SEO Meta Tags */}
            <Head>
                <title>{`${item.name} - Recipe & Culinary Details | ${settings.brand_name}`}</title>
                <meta
                    name="description"
                    content={`${item.name} - ${item.description?.replace(/<[^>]*>?/gm, '') || 'Gourmet artisan recipe prepared fresh on order.'} Price: ${formatCurrency(item.price, settings.default_currency)}. Available at ${settings.brand_name}.`}
                />
                <meta name="keywords" content={`${item.name}, ${item.category?.name}, recipe, ingredients, ${settings.brand_name}, online order`} />
                <meta property="og:title" content={`${item.name} | ${settings.brand_name}`} />
                <meta
                    property="og:description"
                    content={item.description?.replace(/<[^>]*>?/gm, '') || `Explore the exquisite recipe of ${item.name}.`}
                />
                <meta property="og:image" content={dishImage} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${item.name} | ${settings.brand_name}`} />
                <meta name="twitter:description" content={item.description?.replace(/<[^>]*>?/gm, '') || 'Artisan gourmet recipe.'} />
                <meta name="twitter:image" content={dishImage} />
                <script type="application/ld+json">{JSON.stringify(recipeSchema)}</script>
            </Head>

            {/* Main Recipe Content */}
            <main className="mx-auto max-w-7xl px-4 pt-24 sm:pt-28 pb-16 sm:px-6 lg:px-8">
                {/* Hero Dish Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left: Dish Visual Presentation (5 cols) */}
                    <div className="lg:col-span-5 space-y-6" data-aos="fade-right">
                        <div className="relative aspect-square w-full rounded-3xl overflow-hidden glass-panel shadow-xl group border border-slate-200/90 dark:border-white/10">
                            <img
                                src={dishImage}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>

                            {/* Floating Top Badges */}
                            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                                <span className="rounded-full bg-orange-600 px-3.5 py-1 font-montserrat text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                                    {item.category?.name ?? 'Signature Dish'}
                                </span>
                                {item.is_featured && (
                                    <span className="rounded-full bg-amber-500 px-3 py-1 font-montserrat text-[10px] font-extrabold uppercase tracking-widest text-slate-950 shadow-md flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-current" /> Chef Special
                                    </span>
                                )}
                            </div>

                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-all shadow"
                                title="Copy recipe link"
                            >
                                <Share2 className="h-4 w-4" />
                            </button>

                            {/* Bottom Overlay Label */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                                    <CheckCircle className="h-4 w-4" /> Made Fresh on Order
                                </span>
                                <span className="rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1.5 font-montserrat text-sm font-extrabold text-amber-300 border border-white/15">
                                    {formatCurrency(item.price, settings.default_currency)}
                                </span>
                            </div>
                        </div>

                        {copied && (
                            <div className="rounded-xl bg-emerald-600/10 border border-emerald-500/30 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                Recipe link copied to clipboard!
                            </div>
                        )}
                    </div>

                    {/* Right: Recipe Details, Story & Specs (7 cols) */}
                    <div className="lg:col-span-7 space-y-6 sm:space-y-8" data-aos="fade-left">
                        {/* Title & Price Header */}
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300 mb-3">
                                <CookingPot className="h-3.5 w-3.5" /> Culinary Story & Recipe
                            </div>
                            <h1 className="font-montserrat text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                                {item.name}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-baseline gap-4">
                                <span className="font-montserrat text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(item.price, settings.default_currency)}
                                </span>
                                <span className="font-inter text-xs text-slate-600 dark:text-slate-400">
                                    Inclusive of artisan preparation & fresh delivery
                                </span>
                            </div>
                        </div>

                        {/* Culinary Specifications Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" data-aos="fade-up" data-aos-delay="100">
                            <div className="glass-panel p-4 rounded-xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                                <Clock className="h-5 w-5 mx-auto text-orange-500" />
                                <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Prep Time</p>
                                <p className="font-montserrat text-xs font-extrabold text-slate-900 dark:text-slate-100">12-18 Mins</p>
                            </div>

                            <div className="glass-panel p-4 rounded-xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                                <Flame className="h-5 w-5 mx-auto text-orange-500 fill-current" />
                                <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Heat Profile</p>
                                <p className="font-montserrat text-xs font-extrabold text-slate-900 dark:text-slate-100">Smoky & Savory</p>
                            </div>

                            <div className="glass-panel p-4 rounded-xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                                <Shield className="h-5 w-5 mx-auto text-orange-500" />
                                <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Quality</p>
                                <p className="font-montserrat text-xs font-extrabold text-slate-900 dark:text-slate-100">Prime Grade</p>
                            </div>

                            <div className="glass-panel p-4 rounded-xl text-center space-y-1 shadow-sm border border-slate-200/90 dark:border-white/10">
                                <Thermometer className="h-5 w-5 mx-auto text-orange-500" />
                                <p className="font-montserrat text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Delivery</p>
                                <p className="font-montserrat text-xs font-extrabold text-slate-900 dark:text-slate-100">Piping Hot</p>
                            </div>
                        </div>

                        {/* Dish Story, Description & HTML Special Content */}
                        <div
                            className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4 shadow-md border-l-4 border-l-orange-500 border-y border-r border-slate-200/90 dark:border-white/10"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            <h3 className="font-montserrat text-sm font-bold uppercase text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <ChefHat className="h-4 w-4 text-orange-500" /> Chef's Recipe Notes & Preparation
                            </h3>

                            {/* Render description safely with HTML support */}
                            {recipeDescription && (
                                <div
                                    className="font-inter text-sm text-slate-800 dark:text-[#e5e2e1]/90 leading-relaxed [&_h2]:font-montserrat [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-orange-400 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-montserrat [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 dark:[&_h3]:text-orange-300 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1"
                                    dangerouslySetInnerHTML={{ __html: recipeDescription }}
                                />
                            )}

                            {/* Render details safely with full HTML tags support (e.g. <h2>Special Recipe</h2><p>...</p>) */}
                            {recipeDetails && (
                                <div
                                    className="font-inter text-sm text-slate-800 dark:text-[#e5e2e1]/90 leading-relaxed pt-3 border-t border-slate-200 dark:border-white/10 [&_h1]:font-montserrat [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h1]:my-3 [&_h2]:font-montserrat [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-orange-400 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-montserrat [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 dark:[&_h3]:text-orange-300 [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:my-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_em]:italic"
                                    dangerouslySetInnerHTML={{ __html: recipeDetails }}
                                />
                            )}

                            {!recipeDescription && !recipeDetails && (
                                <p className="font-inter text-sm text-slate-700 dark:text-[#e5e2e1]/85 leading-relaxed">
                                    Crafted by our master kitchen brigade, this creation blends hand-selected prime ingredients with artisanal
                                    seasoning, delivering an exquisite explosion of warmth, texture, and deep late-night flavor.
                                </p>
                            )}
                        </div>

                        {/* Order Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-4" data-aos="fade-up" data-aos-delay="250">
                            {settings.enable_whatsapp !== false ? (
                                <>
                                    <a
                                        href={generateWhatsAppLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-4 px-8 font-montserrat text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-orange-500/30 transition-all hover:scale-105 hover:brightness-110 active:scale-95 neon-glow text-center"
                                    >
                                        <Flame className="h-5 w-5 fill-current" />
                                        <span>Order This Recipe on WhatsApp</span>
                                    </a>

                                    <a
                                        href={`tel:${cleanVoicePhone}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white py-4 px-6 font-montserrat text-xs font-bold uppercase tracking-wider text-slate-800 hover:bg-slate-100 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 shadow-sm"
                                    >
                                        <Phone className="h-4 w-4" />
                                        <span>Call Kitchen</span>
                                    </a>
                                </>
                            ) : (
                                <a
                                    href={`tel:${cleanVoicePhone}`}
                                    className="flex-1 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 py-4 px-8 font-montserrat text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-orange-500/30 transition-all hover:scale-105 hover:brightness-110 active:scale-95 neon-glow text-center"
                                >
                                    <Phone className="h-5 w-5" />
                                    <span>Call Kitchen to Order ({settings.phone})</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Dishes / "You May Also Crave" */}
                {relatedItems && relatedItems.length > 0 && (
                    <section className="mt-20 sm:mt-24 pt-16 border-t border-slate-200/90 dark:border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4" data-aos="fade-up">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                                    Complementary Pairings
                                </span>
                                <h2 className="font-montserrat text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e] mt-1.5">
                                    You May Also Crave
                                </h2>
                            </div>
                            <Link
                                href="/#lineup"
                                className="font-montserrat text-xs font-bold text-orange-600 hover:underline uppercase tracking-wider dark:text-orange-400"
                            >
                                View All Dishes →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {relatedItems.map((dish, idx) => (
                                <Link
                                    key={dish.id}
                                    href={getRecipeUrl(dish)}
                                    data-aos="fade-up"
                                    data-aos-delay={idx * 120}
                                    className="glass-panel rounded-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between shadow-md hover:shadow-xl hover:border-orange-500/50 border border-slate-200/90 dark:border-white/10"
                                >
                                    <div>
                                        <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-900">
                                            <img
                                                src={dish.image_path || DEFAULT_RECIPE_IMAGE}
                                                alt={dish.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                                            <div className="absolute top-4 right-4 z-20 rounded-full bg-orange-600 px-3 py-1 font-montserrat text-xs font-extrabold text-white shadow">
                                                {formatCurrency(dish.price, settings.default_currency)}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-montserrat text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors dark:text-slate-100 dark:group-hover:text-orange-400">
                                                {dish.name}
                                            </h3>
                                            <p className="font-inter text-xs text-slate-700 mt-2 line-clamp-2 dark:text-[#e5e2e1]/75">
                                                {dish.description?.replace(/<[^>]*>?/gm, '') || 'Artisan culinary dish handcrafted with care.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
                                        <span className="font-montserrat text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                                            Explore Recipe →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </SurfaceLayout>
    );
}
