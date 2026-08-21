import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import RichTextEditor from '@/components/rich-text-editor';
import { formatCurrency, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Edit,
    Eye,
    Filter,
    Image as ImageIcon,
    Loader2,
    Plus,
    Search,
    Trash2,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    name: string;
    category_id: number;
    description?: string;
    details?: string;
    price: number;
    image_path?: string;
    is_available: boolean;
    is_featured: boolean;
    category?: Category;
}

interface Props {
    menuItems: {
        data: MenuItem[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
    };
    categories: Category[];
    currency: string;
    filters: {
        search?: string;
        category_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Menu Items', href: '/administration-control/menu' },
];

export default function MenuIndex({ menuItems, categories, currency, filters }: Props) {
    const [showDishModal, setShowDishModal] = useState(false);
    const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
    const [viewingDetailsDish, setViewingDetailsDish] = useState<MenuItem | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmittingDish, setIsSubmittingDish] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Search and filter state
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    // Dish Form
    const dishForm = useForm<{
        name: string;
        category_id: number | string;
        description: string;
        details: string;
        price: number;
        image_path: string;
        image: File | null;
        is_available: boolean;
        is_featured: boolean;
    }>({
        name: '',
        category_id: categories[0]?.id || '',
        description: '',
        details: '',
        price: 0,
        image_path: '',
        image: null,
        is_available: true,
        is_featured: false,
    });

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dishForm.setData('image', file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const removeImage = () => {
        dishForm.setData((prev) => ({ ...prev, image: null, image_path: '' }));
        setImagePreview(null);
    };

    const openCreateDish = () => {
        setEditingDish(null);
        dishForm.reset();
        dishForm.setData({
            name: '',
            category_id: categories[0]?.id || '',
            description: '',
            details: '',
            price: 0,
            image_path: '',
            image: null,
            is_available: true,
            is_featured: false,
        });
        setImagePreview(null);
        setShowDishModal(true);
    };

    const openEditDish = (dish: MenuItem) => {
        setEditingDish(dish);
        dishForm.setData({
            name: dish.name,
            category_id: dish.category_id,
            description: dish.description || '',
            details: dish.details || '',
            price: dish.price,
            image_path: dish.image_path || '',
            image: null,
            is_available: dish.is_available,
            is_featured: dish.is_featured,
        });
        setImagePreview(dish.image_path || null);
        setShowDishModal(true);
    };

    const submitDishForm = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingDish(true);
        if (editingDish) {
            router.post(
                `/administration-control/menu/${editingDish.id}`,
                {
                    _method: 'put',
                    ...dishForm.data,
                },
                {
                    onSuccess: () => {
                        setShowDishModal(false);
                        showToast(`Menu dish "${dishForm.data.name}" updated!`, 'success');
                    },
                    onFinish: () => setIsSubmittingDish(false),
                },
            );
        } else {
            dishForm.post('/administration-control/menu', {
                onSuccess: () => {
                    setShowDishModal(false);
                    showToast(`New menu dish "${dishForm.data.name}" created!`, 'success');
                },
                onFinish: () => setIsSubmittingDish(false),
            });
        }
    };

    const toggleAvailability = (dish: MenuItem) => {
        setTogglingId(dish.id);
        router.post(
            `/administration-control/menu/${dish.id}/toggle-availability`,
            {},
            {
                onSuccess: () => showToast(`Dish "${dish.name}" availability toggled`, 'info'),
                onFinish: () => setTogglingId(null),
            },
        );
    };

    const handleDeleteDish = async (dish: MenuItem) => {
        const confirmed = await showConfirm(`Delete menu item "${dish.name}"?`, 'Action cannot be undone.');
        if (confirmed) {
            setDeletingId(dish.id);
            router.delete(`/administration-control/menu/${dish.id}`, {
                onSuccess: () => showToast(`Dish "${dish.name}" deleted`, 'success'),
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const applySearchFilters = () => {
        router.get('/administration-control/menu', { search, category_id: categoryId }, { preserveState: true });
    };

    const resetSearchFilters = () => {
        setSearch('');
        setCategoryId('');
        router.get('/administration-control/menu', {}, { preserveState: true });
    };

    // Helper to render plain-text excerpt of HTML details
    const getExcerpt = (html?: string) => {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Catalog & Recipes" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <UtensilsCrossed className="h-6 w-6 text-amber-500" /> Menu Catalog & Recipes
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Dish pricing, image management, and rich recipe details
                        </p>
                    </div>

                    <button
                        onClick={openCreateDish}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" /> Add New Menu Dish
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search dishes by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applySearchFilters()}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-10 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                            />
                        </div>

                        <div className="w-full sm:w-48">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetSearchFilters}
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                            Reset
                        </button>
                        <button
                            onClick={applySearchFilters}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                        >
                            <Filter className="h-3.5 w-3.5" /> Search
                        </button>
                    </div>
                </div>

                {/* Dish Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Dish Name & Category</th>
                                    <th className="p-3.5">Recipe & Details</th>
                                    <th className="p-3.5 text-right">Selling Price</th>
                                    <th className="p-3.5 text-center">In-Stock Toggle</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {menuItems.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">
                                            No menu items found.
                                        </td>
                                    </tr>
                                ) : (
                                    menuItems.data.map((dish) => {
                                        const excerpt = getExcerpt(dish.details);
                                        return (
                                            <tr key={dish.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                                                            {dish.image_path ? (
                                                                <img src={dish.image_path} alt={dish.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-amber-500">
                                                                    <UtensilsCrossed className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                                                                {dish.name}
                                                                {dish.is_featured && (
                                                                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                                {dish.category?.name ?? 'General'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 max-w-xs">
                                                    {dish.details ? (
                                                        <div className="flex flex-col gap-1">
                                                            <p className="line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400">
                                                                {excerpt}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingDetailsDish(dish)}
                                                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 w-fit cursor-pointer"
                                                            >
                                                                <BookOpen className="h-3 w-3" /> View Full Details
                                                            </button>
                                                        </div>
                                                    ) : dish.description ? (
                                                        <p className="line-clamp-2 text-[11px] text-slate-500 italic">
                                                            {dish.description}
                                                        </p>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">
                                                            No details added yet
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                    {formatCurrency(dish.price, currency)}
                                                </td>
                                                <td className="p-3.5 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleAvailability(dish)}
                                                        disabled={togglingId === dish.id}
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                                                            dish.is_available
                                                                ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        {togglingId === dish.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : null}
                                                        {dish.is_available ? 'Available' : 'Out of Stock'}
                                                    </button>
                                                </td>
                                                <td className="p-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {dish.details && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingDetailsDish(dish)}
                                                                title="View Details"
                                                                className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 cursor-pointer"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openEditDish(dish)}
                                                            title="Edit Dish"
                                                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDish(dish)}
                                                            disabled={deletingId === dish.id}
                                                            title="Delete Dish"
                                                            className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            {deletingId === dish.id ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <Pagination links={menuItems.links} from={menuItems.from} to={menuItems.to} total={menuItems.total} />
                </div>

                {/* Create / Edit Dish Modal */}
                {showDishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-h-[92vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {editingDish ? 'Edit Menu Dish & Details' : 'Create New Menu Dish'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowDishModal(false)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={submitDishForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Dish Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Grilled Ribeye Steak"
                                        value={dishForm.data.name}
                                        onChange={(e) => dishForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category *</label>
                                        <select
                                            value={dishForm.data.category_id}
                                            onChange={(e) => dishForm.setData('category_id', parseInt(e.target.value))}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                        >
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Selling Price ({currency}) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={dishForm.data.price}
                                            onChange={(e) => dishForm.setData('price', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                        Dish Image
                                    </label>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        {/* Image Preview Box */}
                                        <div className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Dish Preview" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-1 right-1 rounded-full bg-rose-500 p-1 text-white shadow hover:bg-rose-600 cursor-pointer"
                                                        title="Remove image"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="h-6 w-6" />
                                                    <span className="text-[9px]">No image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Image File & URL inputs */}
                                        <div className="flex-1 space-y-2">
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-slate-500">Upload Image File (Live Preview)</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageFileChange}
                                                    className="w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-amber-600 hover:file:bg-amber-500/20 dark:file:bg-amber-500/20 dark:file:text-amber-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-[10px] font-medium text-slate-500">Or Image URL</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={dishForm.data.image_path}
                                                    onChange={(e) => {
                                                        dishForm.setData('image_path', e.target.value);
                                                        if (e.target.value) setImagePreview(e.target.value);
                                                    }}
                                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                        Short Summary / Subtitle (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Brief 1-line description displayed on cards..."
                                        value={dishForm.data.description}
                                        onChange={(e) => dishForm.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                    />
                                </div>

                                {/* Rich Text Editor for Details */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            Dish Details, Recipe & Ingredients (Rich Text)
                                        </label>
                                        <span className="text-[10px] text-slate-400">
                                            Formatted recipes, ingredients list, cooking directions & allergen info
                                        </span>
                                    </div>
                                    <RichTextEditor
                                        value={dishForm.data.details}
                                        onChange={(val) => dishForm.setData('details', val)}
                                        placeholder="Enter full recipe details, ingredients list, step-by-step cooking directions, allergy warnings, etc..."
                                        minHeight="220px"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={dishForm.data.is_available}
                                            onChange={(e) => dishForm.setData('is_available', e.target.checked)}
                                            className="rounded border-slate-300 bg-slate-100 text-amber-500 dark:border-slate-800 dark:bg-slate-950 focus:ring-amber-500"
                                        />
                                        <span>Available for Order</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={dishForm.data.is_featured}
                                            onChange={(e) => dishForm.setData('is_featured', e.target.checked)}
                                            className="rounded border-slate-300 bg-slate-100 text-amber-500 dark:border-slate-800 dark:bg-slate-950 focus:ring-amber-500"
                                        />
                                        <span>Featured Special Dish</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowDishModal(false)}
                                        disabled={isSubmittingDish || dishForm.processing}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingDish || dishForm.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isSubmittingDish || dishForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>{editingDish ? 'Updating Dish...' : 'Saving Dish...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingDish ? 'Update Dish' : 'Save Dish'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Full Details Modal */}
                {viewingDetailsDish && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-h-[85vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                                        {viewingDetailsDish.image_path ? (
                                            <img src={viewingDetailsDish.image_path} alt={viewingDetailsDish.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-amber-500">
                                                <UtensilsCrossed className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                                            {viewingDetailsDish.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-500">
                                            {viewingDetailsDish.category?.name} • {formatCurrency(viewingDetailsDish.price, currency)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewingDetailsDish(null)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {viewingDetailsDish.description && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">Summary: </span>
                                    {viewingDetailsDish.description}
                                </div>
                            )}

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider dark:text-slate-200">
                                    Recipe & Preparation Details
                                </h4>
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_pre]:bg-slate-900 [&_pre]:text-amber-300 [&_pre]:p-2.5 [&_pre]:rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: viewingDetailsDish.details || '<i>No details recorded.</i>' }}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const dish = viewingDetailsDish;
                                        setViewingDetailsDish(null);
                                        openEditDish(dish);
                                    }}
                                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    <Edit className="h-3.5 w-3.5" /> Edit Details
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewingDetailsDish(null)}
                                    className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
