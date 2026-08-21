import SurfaceLayout from '@/components/surface/surface-layout';
import { formatCurrency } from '@/lib/swal';
import { Head, Link } from '@inertiajs/react';
import { ChefHat, CookingPot, Flame, MessageCircle, Search, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SurfaceSettings } from '@/components/surface/surface-header';

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

interface Props {
    settings: SurfaceSettings;
    menuCategories: MenuCategory[];
    allDishes: MenuItem[];
}

const DEFAULT_FALLBACK_IMAGES = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAgx_WRv3kuWUFuNT_Wia142uEUZYtTvie7-4E7aVozFm0HRA-dXviDoaRMcpRGlJlX6fR34IAi6c9iJOC8mgBeyRQP0FQgUP2uQximWxWWaYRDG1dRg-BHc_sohGQFcP9GIejGrZp93hsjNLMBJ_oUblGrTxNzidjyXOlfZ9OMah8LYLo7n8y1DSqi7rguI-skewLi1YLaj6TlviJV02EHc7PUpAmDP4SHhz4FWQMhZKYuOas0gHyyg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2LxGOqn8H8R482FU2ybovgZYVI73qnI0D-7A_qlb48iiZzKd1OqBYVB-Aw_-U_L40FiICYgyno3npqB_bo9E9vTV-vSfji9qvM2ACKrAol3QR-QKucFllf5kneD9Y5Y0Td0_LLHnk1BK2g8Fppq4Bax64oI5uT0Bg6tNDLqBhamGUzO5WGTgKP41S3_CuwMz46Nz98-_c8ch2VcOvJmk1ugwZgJQ7fonJL1LedVQ53seGQHFOvo7N-Q',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2_bVlvk1Q4Ba3dX6u6d1yxVzE8kiIZ6E2xlx8ZtxEYUlpCJ9BCu3SX-p4gr2MYdToU92-z_egfMoydPvEEM9lo_qEPATvFGEIispZE0dHgvLm0I_k3d9b2mm4K9_pNAHonyLyma_tnn8v6YNZHHA3OFlK4UO0PydJjf59Dm6GsnCkcQ9koHT0M21mRKaT8MDeWsgemp75RvkAqJIMpceQoyAC_UOJWs-MrT4RyD_rvoR9KZ7KNF8rPA',
];

const getRecipeUrl = (dish: { id: number; name: string }) => {
    const slug = dish.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `/recipi/${dish.id}/${slug || 'dish'}`;
};

export default function RecipesPage({ settings, menuCategories, allDishes }: Props) {
    const [activeTab, setActiveTab] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).AOS) {
            (window as any).AOS.init({
                duration: 700,
                easing: 'ease-out-cubic',
                once: true,
                offset: 50,
            });
            (window as any).AOS.refresh();
        }
    }, [activeTab, searchQuery]);

    const targetWhatsApp = settings.whatsapp_number || settings.phone || '+8801700000000';
    const cleanPhone = targetWhatsApp.replace(/[^0-9]/g, '');
    const generateWhatsAppLink = (dishName?: string) => {
        const text = dishName
            ? `Hello ${settings.brand_name}, I would like to order the recipe: ${dishName}`
            : `Hello ${settings.brand_name}, I have an inquiry about recipes and orders.`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    };

    const filteredDishes = (activeTab === 'all' ? allDishes : allDishes.filter((d) => d.category?.id === activeTab)).filter(
        (dish) =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const getDishImage = (dish: MenuItem, index: number) => {
        if (dish.image_path) return dish.image_path;
        return DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length];
    };

    return (
        <SurfaceLayout settings={settings} isSubpage={true} backUrl="/" backLabel="Home">
            <Head>
                <title>{`All Gourmet Recipes & Culinary Menu | ${settings.brand_name}`}</title>
                <meta
                    name="description"
                    content={`Browse the complete catalogue of artisan late-night fast food recipes and gourmet dishes handcrafted by ${settings.brand_name}.`}
                />
                <meta name="keywords" content={`recipes, menu, gourmet, fast food, ${settings.brand_name}`} />
            </Head>

            <main className="mx-auto max-w-7xl px-4 pt-24 sm:pt-28 pb-20 sm:px-6 lg:px-8">
                {/* Page Title & Search Header */}
                <div className="mb-10 text-center max-w-3xl mx-auto space-y-4" data-aos="fade-up">
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 font-montserrat text-xs font-bold uppercase tracking-widest text-orange-800 dark:text-orange-300">
                        <CookingPot className="h-3.5 w-3.5" /> Full Recipe Catalogue
                    </div>
                    <h1 className="font-montserrat text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-[#ffb59e]">
                        All Culinary Creations
                    </h1>
                    <p className="font-inter text-sm text-slate-700 dark:text-[#e5e2e1]/80 max-w-xl mx-auto">
                        Explore our comprehensive collection of artisan recipes, flavor profiles, and seasonal nocturnal creations. Click any dish to uncover the chef's culinary notes.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto pt-2">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search recipes by name, ingredient, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full border border-slate-300 bg-white py-3.5 pr-4 pl-11 text-xs text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:outline-none dark:border-white/15 dark:bg-[#1c1b1b] dark:text-slate-100"
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none flex-wrap" data-aos="fade-up">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-full px-5 py-2.5 font-montserrat text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                            activeTab === 'all'
                                ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25 neon-glow'
                                : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:border-orange-400 dark:border-white/10 dark:bg-[#1c1b1b] dark:text-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        All Recipes ({allDishes.length})
                    </button>
                    {menuCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`rounded-full px-5 py-2.5 font-montserrat text-xs font-bold transition-all uppercase tracking-wider shrink-0 ${
                                activeTab === cat.id
                                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25 neon-glow'
                                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:border-orange-400 dark:border-white/10 dark:bg-[#1c1b1b] dark:text-slate-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {cat.name} ({cat.menu_items.length})
                        </button>
                    ))}
                </div>

                {/* Grid of Dishes */}
                {filteredDishes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center dark:border-white/10 dark:bg-[#1c1b1b]" data-aos="fade-up">
                        <Utensils className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
                        <p className="font-montserrat font-bold text-slate-800 dark:text-slate-200">No recipes matched your search.</p>
                        <p className="font-inter text-xs text-slate-600 dark:text-slate-400 mt-1">Try another keyword or select All Recipes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredDishes.map((dish, idx) => (
                            <Link
                                key={dish.id}
                                href={getRecipeUrl(dish)}
                                data-aos="fade-up"
                                data-aos-delay={(idx % 6) * 70}
                                className="glass-panel rounded-2xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between shadow-md hover:shadow-2xl hover:border-orange-500/60 border border-slate-200/90 dark:border-white/10 cursor-pointer"
                            >
                                <div>
                                    {/* Dish Image with Price and Badges */}
                                    <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-900">
                                        <img
                                            src={getDishImage(dish, idx)}
                                            alt={dish.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>

                                        {/* Price Badge */}
                                        <div className="absolute top-4 right-4 z-20 rounded-full bg-orange-600/95 backdrop-blur-md px-3.5 py-1.5 font-montserrat text-xs font-extrabold text-white shadow-lg">
                                            {formatCurrency(dish.price, settings.default_currency || '৳')}
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
                                        href={generateWhatsAppLink(dish.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 font-montserrat text-xs font-bold text-white shadow transition-all hover:bg-emerald-500 active:scale-95 z-20 relative"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>Order</span>
                                    </a>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </SurfaceLayout>
    );
}
