import AppLayout from '@/layouts/app-layout';
import { showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Boxes,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Edit,
    FolderTree,
    Plus,
    Search,
    Tag,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface Category {
    id: number;
    name: string;
    type: 'inventory' | 'menu' | 'expense';
    description?: string;
    inventory_items_count?: number;
    menu_items_count?: number;
    expenses_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
];

export default function CategoriesIndex({ categories = [] }: Props) {
    const { flash } = usePage().props as any;

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'inventory' | 'menu' | 'expense'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    // Handle flash messages
    useEffect(() => {
        if (flash?.error) {
            showToast(flash.error, 'error');
        } else if (flash?.success) {
            showToast(flash.success, 'success');
        }
    }, [flash]);

    // Form setup
    const form = useForm<{
        name: string;
        type: 'inventory' | 'menu' | 'expense';
        description: string;
    }>({
        name: '',
        type: 'inventory',
        description: '',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        form.setData({
            name: '',
            type: 'inventory',
            description: '',
        });
        form.clearErrors();
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        form.setData({
            name: cat.name,
            type: cat.type,
            description: cat.description || '',
        });
        form.clearErrors();
        setShowModal(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('Category updated successfully!', 'success');
                },
            });
        } else {
            form.post('/admin/categories', {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('New category created successfully!', 'success');
                },
            });
        }
    };

    const handleDelete = async (cat: Category) => {
        const usageCount = (cat.inventory_items_count || 0) + (cat.menu_items_count || 0) + (cat.expenses_count || 0);
        if (usageCount > 0) {
            showToast(`Cannot delete category with ${usageCount} associated items/expenses.`, 'error');
            return;
        }

        const confirmed = await showConfirm(
            `Delete category "${cat.name}"?`,
            'This action cannot be undone.'
        );

        if (confirmed) {
            router.delete(`/admin/categories/${cat.id}`, {
                onSuccess: () => showToast('Category deleted', 'success'),
            });
        }
    };

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const inv = categories.filter((c) => c.type === 'inventory').length;
        const menu = categories.filter((c) => c.type === 'menu').length;
        const exp = categories.filter((c) => c.type === 'expense').length;
        return { total: categories.length, inv, menu, exp };
    }, [categories]);

    // Filtering Logic
    const filteredCategories = useMemo(() => {
        return categories.filter((cat) => {
            if (selectedType !== 'all' && cat.type !== selectedType) {
                return false;
            }
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const nameMatch = cat.name.toLowerCase().includes(term);
                const descMatch = (cat.description || '').toLowerCase().includes(term);
                if (!nameMatch && !descMatch) return false;
            }
            return true;
        });
    }, [categories, selectedType, searchTerm]);

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / perPage));

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredCategories.slice(start, start + perPage);
    }, [filteredCategories, currentPage, perPage]);

    const getTypeBadge = (type: Category['type']) => {
        switch (type) {
            case 'inventory':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-400">
                        <Boxes className="h-3 w-3" /> Inventory
                    </span>
                );
            case 'menu':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <UtensilsCrossed className="h-3 w-3" /> Menu
                    </span>
                );
            case 'expense':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/60 dark:text-purple-400">
                        <DollarSign className="h-3 w-3" /> Expense
                    </span>
                );
        }
    };

    const getUsageSummary = (cat: Category) => {
        if (cat.type === 'inventory') {
            return `${cat.inventory_items_count || 0} Inventory Items`;
        }
        if (cat.type === 'menu') {
            return `${cat.menu_items_count || 0} Menu Items`;
        }
        if (cat.type === 'expense') {
            return `${cat.expenses_count || 0} Expense Entries`;
        }
        return '-';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Management" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <FolderTree className="h-7 w-7 text-amber-500" /> Category Management
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Organize items across Inventory, Menu, and Expense modules
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 focus:ring-2 focus:ring-amber-500/50"
                    >
                        <Plus className="h-4 w-4" /> Add New Category
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                    <button
                        onClick={() => {
                            setSelectedType('all');
                            setCurrentPage(1);
                        }}
                        className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
                            selectedType === 'all'
                                ? 'border-amber-500/50 bg-amber-500/10 shadow-sm dark:bg-amber-500/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">All Categories</span>
                            <Tag className="h-4 w-4 text-amber-500" />
                        </div>
                        <span className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedType('inventory');
                            setCurrentPage(1);
                        }}
                        className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
                            selectedType === 'inventory'
                                ? 'border-blue-500/50 bg-blue-500/10 shadow-sm dark:bg-blue-500/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Inventory</span>
                            <Boxes className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inv}</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedType('menu');
                            setCurrentPage(1);
                        }}
                        className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
                            selectedType === 'menu'
                                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm dark:bg-emerald-500/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Menu & Recipes</span>
                            <UtensilsCrossed className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.menu}</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedType('expense');
                            setCurrentPage(1);
                        }}
                        className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
                            selectedType === 'expense'
                                ? 'border-purple-500/50 bg-purple-500/10 shadow-sm dark:bg-purple-500/10'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expenses</span>
                            <DollarSign className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.exp}</span>
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categories by name or description..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        {(['all', 'inventory', 'menu', 'expense'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setSelectedType(type);
                                    setCurrentPage(1);
                                }}
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                                    selectedType === type
                                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                {type === 'all' ? 'All Types' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Category Name</th>
                                    <th className="p-3.5">Module Type</th>
                                    <th className="p-3.5">Description</th>
                                    <th className="p-3.5 text-center">Associated Items</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {paginatedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            No categories match your current search or filter.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCategories.map((cat) => (
                                        <tr key={cat.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                                                {cat.name}
                                            </td>
                                            <td className="p-3.5">{getTypeBadge(cat.type)}</td>
                                            <td className="max-w-md truncate p-3.5 text-slate-500 dark:text-slate-400">
                                                {cat.description || '-'}
                                            </td>
                                            <td className="p-3.5 text-center font-medium text-slate-600 dark:text-slate-400">
                                                {getUsageSummary(cat)}
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(cat)}
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        title="Edit Category"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat)}
                                                        className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 sm:flex-row dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                                Showing{' '}
                                <strong className="text-slate-900 dark:text-slate-100">
                                    {filteredCategories.length === 0 ? 0 : (currentPage - 1) * perPage + 1}
                                </strong>{' '}
                                to{' '}
                                <strong className="text-slate-900 dark:text-slate-100">
                                    {Math.min(currentPage * perPage, filteredCategories.length)}
                                </strong>{' '}
                                of <strong className="text-slate-900 dark:text-slate-100">{filteredCategories.length}</strong> categories
                            </span>

                            <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>

                            <label className="flex items-center gap-1">
                                <span>Per page:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </label>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                                            currentPage === page
                                                ? 'bg-amber-500 text-slate-950 font-bold'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create / Edit Category Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={submitForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Seafood, Fast Food, Cleaning Supplies..."
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                    {form.errors.name && <p className="mt-1 text-[11px] text-rose-500">{form.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category Type *</label>
                                    <select
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value as any)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        <option value="inventory">Inventory (Raw ingredients, stock, supplies)</option>
                                        <option value="menu">Menu (Food & drink categories on restaurant menu)</option>
                                        <option value="expense">Expense (Operational, utilities, rent, overheads)</option>
                                    </select>
                                    {form.errors.type && <p className="mt-1 text-[11px] text-rose-500">{form.errors.type}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description or notes regarding this category..."
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                    {form.errors.description && <p className="mt-1 text-[11px] text-rose-500">{form.errors.description}</p>}
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition-all hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-50"
                                    >
                                        {editingCategory ? 'Update Category' : 'Save Category'}
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
