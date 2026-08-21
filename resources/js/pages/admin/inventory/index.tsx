import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatHumanDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Boxes, Edit, Loader2, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface InventoryMovement {
    id: number;
    inventory_item_id: number;
    type: string;
    quantity: number;
    unit: string;
    cost_per_unit?: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    created_at?: string;
}

interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category_id: number;
    unit: string;
    current_stock: number;
    min_stock_threshold: number;
    cost_per_unit: number;
    expiry_date?: string;
    notes?: string;
    category?: Category;
    movements?: InventoryMovement[];
}

interface Props {
    items: {
        data: InventoryItem[];
        links: any[];
        total: number;
    };
    categories: Category[];
    currency: string;
    filters: {
        search?: string;
        category_id?: string;
        low_stock?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Inventory & Stock Master', href: '/administration-control/inventory' },
];

export default function InventoryIndex({ items, categories, currency, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [lowStockOnly, setLowStockOnly] = useState(filters.low_stock === 'true');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Stock Adjustment Modal
    const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
    const adjustForm = useForm({
        type: 'in',
        quantity: 1,
        unit: '',
        notes: '',
    });

    // Item CRUD Form
    const itemForm = useForm({
        name: '',
        sku: '',
        category_id: categories[0]?.id || '',
        unit: 'kg',
        current_stock: 0,
        min_stock_threshold: 5,
        cost_per_unit: 0,
        expiry_date: '',
        notes: '',
    });

    const handleFilter = () => {
        router.get(
            '/administration-control/inventory',
            {
                search,
                category_id: selectedCategory,
                low_stock: lowStockOnly ? 'true' : '',
            },
            { preserveState: true },
        );
    };

    const openCreateModal = () => {
        setEditingItem(null);
        itemForm.setData({
            name: '',
            sku: '',
            category_id: categories[0]?.id || '',
            unit: 'kg',
            current_stock: 0,
            min_stock_threshold: 5,
            cost_per_unit: 0,
            expiry_date: '',
            notes: '',
        });
        itemForm.clearErrors();
        setShowModal(true);
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        itemForm.setData({
            name: item.name,
            sku: item.sku || '',
            category_id: item.category_id,
            unit: item.unit,
            current_stock: item.current_stock,
            min_stock_threshold: item.min_stock_threshold,
            cost_per_unit: item.cost_per_unit,
            expiry_date: item.expiry_date || '',
            notes: item.notes || '',
        });
        setShowModal(true);
    };

    const submitItemForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            itemForm.put(`/administration-control/inventory/${editingItem.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('Inventory item updated successfully!', 'success');
                },
            });
        } else {
            itemForm.post('/administration-control/inventory', {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('New ingredient item created!', 'success');
                },
            });
        }
    };

    const handleDelete = async (item: InventoryItem) => {
        const confirmed = await showConfirm(`Delete "${item.name}"?`, 'This action cannot be undone.');
        if (confirmed) {
            setDeletingId(item.id);
            router.delete(`/administration-control/inventory/${item.id}`, {
                onSuccess: () => showToast(`Inventory item "${item.name}" deleted`, 'success'),
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const openAdjustModal = (item: InventoryItem) => {
        setAdjustingItem(item);
        adjustForm.setData({
            type: 'in',
            quantity: 1,
            unit: item.unit,
            notes: '',
        });
        adjustForm.clearErrors();
    };

    const submitStockAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adjustingItem) return;

        adjustForm.post(`/administration-control/inventory/${adjustingItem.id}/adjust`, {
            onSuccess: () => {
                setAdjustingItem(null);
                showToast(`Stock updated for ${adjustingItem.name}`, 'success');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory & Raw Stock Master" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Boxes className="h-6 w-6 text-amber-500" /> Raw Inventory & Stock Master
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Manage raw ingredients, unit measurements, low stock thresholds, and stock movements
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                    >
                        <Plus className="h-4 w-4" /> Add Inventory Item
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex w-full flex-1 items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by ingredient name or SKU code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={lowStockOnly}
                                onChange={(e) => setLowStockOnly(e.target.checked)}
                                className="rounded border-slate-300 bg-slate-100 text-amber-500 dark:border-slate-800 dark:bg-slate-950"
                            />
                            <span>Low Stock Only</span>
                        </label>
                    </div>

                    <button
                        onClick={handleFilter}
                        className="w-full rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-300 md:w-auto dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        Filter Results
                    </button>
                </div>

                {/* Stock Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Ingredient & SKU</th>
                                    <th className="p-3.5">Category</th>
                                    <th className="p-3.5 text-right">Current Stock</th>
                                    <th className="p-3.5 text-right">Min Threshold</th>
                                    <th className="p-3.5 text-right">Cost / Unit</th>
                                    <th className="p-3.5">Expiry Date</th>
                                    <th className="p-3.5">Notes</th>
                                    <th className="p-3.5 text-center">Adjust Stock</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {items.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-slate-500">
                                            No inventory items found.
                                        </td>
                                    </tr>
                                ) : (
                                    items.data.map((item) => {
                                        const isLow = item.current_stock <= item.min_stock_threshold;
                                        const displayNote = item.notes || item.movements?.[0]?.notes || '-';
                                        return (
                                            <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="p-3.5">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                                                    <span className="font-mono text-[10px] text-slate-400">{item.sku || 'N/A'}</span>
                                                </td>
                                                <td className="p-3.5">{item.category?.name ?? 'Uncategorized'}</td>
                                                <td className="p-3.5 text-right">
                                                    <span
                                                        className={`font-bold ${isLow ? 'flex items-center justify-end gap-1 text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}
                                                    >
                                                        {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
                                                        {item.current_stock} {item.unit}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right text-slate-400">
                                                    {item.min_stock_threshold} {item.unit}
                                                </td>
                                                <td className="p-3.5 text-right font-semibold">
                                                    {formatCurrency(item.cost_per_unit, currency)} / {item.unit}
                                                </td>
                                                <td className="p-3.5">
                                                    {item.expiry_date ? (
                                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            {formatHumanDate(item.expiry_date)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3.5 max-w-[150px] truncate text-slate-500" title={displayNote !== '-' ? displayNote : ''}>
                                                    {displayNote}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        onClick={() => openAdjustModal(item)}
                                                        className="mx-auto flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 transition-all hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400"
                                                    >
                                                        <RefreshCw className="h-3 w-3" /> Adjust
                                                    </button>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            disabled={deletingId === item.id}
                                                            className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            {deletingId === item.id ? (
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
                </div>

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingItem ? 'Edit Ingredient Item' : 'Add New Inventory Ingredient'}
                            </h3>

                            <form onSubmit={submitItemForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Ingredient Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={itemForm.data.name}
                                        onChange={(e) => itemForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category *</label>
                                        <select
                                            value={itemForm.data.category_id}
                                            onChange={(e) => itemForm.setData('category_id', parseInt(e.target.value))}
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
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Measurement Unit *</label>
                                        <select
                                            value={itemForm.data.unit}
                                            onChange={(e) => itemForm.setData('unit', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="kg">Kilogram (kg)</option>
                                            <option value="g">Gram (g)</option>
                                            <option value="l">Liter (l)</option>
                                            <option value="ml">Milliliter (ml)</option>
                                            <option value="piece">Piece (pc)</option>
                                            <option value="dozen">Dozen</option>
                                            <option value="pack">Pack</option>
                                            <option value="box">Box</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Current Stock</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={itemForm.data.current_stock}
                                            onChange={(e) => itemForm.setData('current_stock', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Min Threshold</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={itemForm.data.min_stock_threshold}
                                            onChange={(e) => itemForm.setData('min_stock_threshold', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Cost / Unit ({currency})</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={itemForm.data.cost_per_unit}
                                            onChange={(e) => itemForm.setData('cost_per_unit', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">SKU / Code</label>
                                        <input
                                            type="text"
                                            placeholder="ING-001"
                                            value={itemForm.data.sku}
                                            onChange={(e) => itemForm.setData('sku', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Expiry Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={itemForm.data.expiry_date}
                                            onChange={(e) => itemForm.setData('expiry_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Notes / Details (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Additional notes about this item..."
                                        value={itemForm.data.notes}
                                        onChange={(e) => itemForm.setData('notes', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        disabled={itemForm.processing}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={itemForm.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {itemForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>{editingItem ? 'Updating Item...' : 'Saving Item...'}</span>
                                            </>
                                        ) : (
                                            <span>{editingItem ? 'Update Item' : 'Save Item'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stock Adjustment Modal */}
                {adjustingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Adjust Stock: {adjustingItem.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Current Stock:{' '}
                                <strong className="text-slate-800 dark:text-slate-200">
                                    {adjustingItem.current_stock} {adjustingItem.unit}
                                </strong>
                            </p>

                            <form onSubmit={submitStockAdjustment} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Adjustment Type *</label>
                                    <select
                                        value={adjustForm.data.type}
                                        onChange={(e) => adjustForm.setData('type', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        <option value="in">Stock In (Purchase / Restock)</option>
                                        <option value="out">Stock Out (Usage / Transfer)</option>
                                        <option value="wastage">Wastage / Spoiled</option>
                                        <option value="return">Vendor Return</option>
                                    </select>
                                    {adjustForm.errors.type && (
                                        <p className="mt-1 text-xs text-rose-500">{adjustForm.errors.type}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={adjustForm.data.quantity}
                                            onChange={(e) => adjustForm.setData('quantity', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                        {adjustForm.errors.quantity && (
                                            <p className="mt-1 text-xs text-rose-500">{adjustForm.errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Unit *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={adjustForm.data.unit}
                                            onChange={(e) => adjustForm.setData('unit', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                        {adjustForm.errors.unit && (
                                            <p className="mt-1 text-xs text-rose-500">{adjustForm.errors.unit}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Notes / Reason</label>
                                    <textarea
                                        rows={2}
                                        value={adjustForm.data.notes}
                                        onChange={(e) => adjustForm.setData('notes', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                    {adjustForm.errors.notes && (
                                        <p className="mt-1 text-xs text-rose-500">{adjustForm.errors.notes}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setAdjustingItem(null)}
                                        disabled={adjustForm.processing}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={adjustForm.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {adjustForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Updating Stock...</span>
                                            </>
                                        ) : (
                                            <span>Confirm Adjustment</span>
                                        )}
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
