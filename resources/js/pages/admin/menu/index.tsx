import AppLayout from '@/layouts/app-layout';
import { formatCurrency, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Image as ImageIcon, Plus, Trash2, UtensilsCrossed, X } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface InventoryItem {
    id: number;
    name: string;
    unit: string;
    cost_per_unit: number;
}

interface Recipe {
    id?: number;
    inventory_item_id: number;
    inventoryItem?: InventoryItem;
    quantity: number;
    unit: string;
}

interface MenuItem {
    id: number;
    name: string;
    category_id: number;
    description?: string;
    price: number;
    image_path?: string;
    is_available: boolean;
    is_featured: boolean;
    category?: Category;
    recipes: Recipe[];
}

interface Props {
    menuItems: MenuItem[];
    categories: Category[];
    inventoryItems: InventoryItem[];
    currency: string;
    filters: {
        search?: string;
        category_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Menu & Recipes', href: '/admin/menu' },
];

export default function MenuIndex({ menuItems, categories, inventoryItems, currency, filters }: Props) {
    const [showDishModal, setShowDishModal] = useState(false);
    const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Recipe Builder Modal State
    const [recipeDish, setRecipeDish] = useState<MenuItem | null>(null);

    // Dish Form
    const dishForm = useForm<{
        name: string;
        category_id: number | string;
        description: string;
        price: number;
        image_path: string;
        image: File | null;
        is_available: boolean;
        is_featured: boolean;
    }>({
        name: '',
        category_id: categories[0]?.id || '',
        description: '',
        price: 0,
        image_path: '',
        image: null,
        is_available: true,
        is_featured: false,
    });

    // Recipe Builder Form
    const recipeForm = useForm({
        ingredients: [] as { inventory_item_id: number; quantity: number; unit: string }[],
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
        setImagePreview(null);
        setShowDishModal(true);
    };

    const openEditDish = (dish: MenuItem) => {
        setEditingDish(dish);
        dishForm.setData({
            name: dish.name,
            category_id: dish.category_id,
            description: dish.description || '',
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
        if (editingDish) {
            router.post(
                `/admin/menu/${editingDish.id}`,
                {
                    _method: 'put',
                    ...dishForm.data,
                },
                {
                    onSuccess: () => {
                        setShowDishModal(false);
                        showToast(`Menu dish "${dishForm.data.name}" updated!`, 'success');
                    },
                },
            );
        } else {
            dishForm.post('/admin/menu', {
                onSuccess: () => {
                    setShowDishModal(false);
                    showToast(`New menu dish "${dishForm.data.name}" created!`, 'success');
                },
            });
        }
    };

    const toggleAvailability = (dish: MenuItem) => {
        router.post(
            `/admin/menu/${dish.id}/toggle-availability`,
            {},
            {
                onSuccess: () => showToast(`Dish "${dish.name}" availability toggled`, 'info'),
            },
        );
    };

    const handleDeleteDish = async (dish: MenuItem) => {
        const confirmed = await showConfirm(`Delete menu item "${dish.name}"?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/admin/menu/${dish.id}`, {
                onSuccess: () => showToast(`Dish "${dish.name}" deleted`, 'success'),
            });
        }
    };

    // Recipe Builder Handlers
    const openRecipeBuilder = (dish: MenuItem) => {
        setRecipeDish(dish);
        recipeForm.setData({
            ingredients: dish.recipes.map((r) => ({
                inventory_item_id: r.inventory_item_id,
                quantity: r.quantity,
                unit: r.unit,
            })),
        });
    };

    const addIngredientRow = () => {
        const firstInv = inventoryItems[0];
        recipeForm.setData('ingredients', [
            ...recipeForm.data.ingredients,
            {
                inventory_item_id: firstInv?.id || 0,
                quantity: 100,
                unit: firstInv?.unit || 'g',
            },
        ]);
    };

    const removeIngredientRow = (index: number) => {
        const newIngs = [...recipeForm.data.ingredients];
        newIngs.splice(index, 1);
        recipeForm.setData('ingredients', newIngs);
    };

    const handleIngredientChange = (index: number, field: string, value: any) => {
        const newIngs = [...recipeForm.data.ingredients];
        newIngs[index] = { ...newIngs[index], [field]: value };

        if (field === 'inventory_item_id') {
            const selectedInv = inventoryItems.find((i) => i.id === Number(value));
            if (selectedInv) {
                newIngs[index].unit = selectedInv.unit;
            }
        }
        recipeForm.setData('ingredients', newIngs);
    };

    const submitRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipeDish) return;

        recipeForm.post(`/admin/menu/${recipeDish.id}/recipe`, {
            onSuccess: () => {
                setRecipeDish(null);
                showToast(`Recipe saved for "${recipeDish.name}"`, 'success');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu & Recipes Management" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <UtensilsCrossed className="h-6 w-6 text-amber-500" /> Menu Catalog & Recipes
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Dish pricing, image management, and ingredient recipe builder
                        </p>
                    </div>

                    <button
                        onClick={openCreateDish}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                    >
                        <Plus className="h-4 w-4" /> Add New Menu Dish
                    </button>
                </div>

                {/* Dish Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Dish Name & Category</th>
                                    <th className="p-3.5 text-right">Selling Price</th>
                                    <th className="p-3.5 text-center">In-Stock Toggle</th>
                                    <th className="p-3.5 text-center">Recipe Ingredients</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {menuItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">
                                            No menu items created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    menuItems.map((dish) => {
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
                                                <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(dish.price, currency)}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        onClick={() => toggleAvailability(dish)}
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                                                            dish.is_available
                                                                ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        {dish.is_available ? 'Available' : 'Out of Stock'}
                                                    </button>
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        onClick={() => openRecipeBuilder(dish)}
                                                        className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-amber-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700"
                                                    >
                                                        Recipe Builder ({dish.recipes.length})
                                                    </button>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditDish(dish)}
                                                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDish(dish)}
                                                            className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
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
                </div>

                {/* Create / Edit Dish Modal */}
                {showDishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingDish ? 'Edit Menu Dish' : 'Create New Menu Dish'}
                            </h3>

                            <form onSubmit={submitDishForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Dish Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={dishForm.data.name}
                                        onChange={(e) => dishForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category *</label>
                                        <select
                                            value={dishForm.data.category_id}
                                            onChange={(e) => dishForm.setData('category_id', parseInt(e.target.value))}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
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
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-amber-500 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                        Dish / Recipe Image
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
                                                        className="absolute top-1 right-1 rounded-full bg-rose-500 p-1 text-white shadow hover:bg-rose-600"
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
                                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Description</label>
                                    <textarea
                                        rows={2}
                                        value={dishForm.data.description}
                                        onChange={(e) => dishForm.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={dishForm.data.is_available}
                                            onChange={(e) => dishForm.setData('is_available', e.target.checked)}
                                            className="rounded border-slate-300 bg-slate-100 text-amber-500 dark:border-slate-800 dark:bg-slate-950"
                                        />
                                        <span>Available for Order</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={dishForm.data.is_featured}
                                            onChange={(e) => dishForm.setData('is_featured', e.target.checked)}
                                            className="rounded border-slate-300 bg-slate-100 text-amber-500 dark:border-slate-800 dark:bg-slate-950"
                                        />
                                        <span>Featured Special Dish</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowDishModal(false)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={dishForm.processing}
                                        className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                    >
                                        Save Dish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Recipe Builder Modal */}
                {recipeDish && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recipe Builder for "{recipeDish.name}"</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Link raw ingredients & quantities for this menu dish.
                            </p>

                            <form onSubmit={submitRecipe} className="space-y-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Ingredients Breakdown</span>
                                    <button
                                        type="button"
                                        onClick={addIngredientRow}
                                        className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Add Ingredient
                                    </button>
                                </div>

                                {recipeForm.data.ingredients.length === 0 ? (
                                    <p className="rounded-xl bg-slate-100 py-6 text-center text-slate-500 dark:bg-slate-950">
                                        No ingredients linked yet.
                                    </p>
                                ) : (
                                    recipeForm.data.ingredients.map((row, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div className="col-span-6">
                                                <label className="mb-1 block text-[10px] text-slate-500">Ingredient</label>
                                                <select
                                                    value={row.inventory_item_id}
                                                    onChange={(e) => handleIngredientChange(idx, 'inventory_item_id', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                >
                                                    {inventoryItems.map((inv) => (
                                                        <option key={inv.id} value={inv.id}>
                                                            {inv.name} ({inv.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-3">
                                                <label className="mb-1 block text-[10px] text-slate-500">Quantity</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={row.quantity}
                                                    onChange={(e) => handleIngredientChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="mb-1 block text-[10px] text-slate-500">Unit</label>
                                                <input
                                                    type="text"
                                                    value={row.unit}
                                                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                            </div>

                                            <div className="col-span-1 pt-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeIngredientRow(idx)}
                                                    className="text-rose-500 hover:text-rose-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setRecipeDish(null)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={recipeForm.processing}
                                        className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                    >
                                        Save Recipe
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
