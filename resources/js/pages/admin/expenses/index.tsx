import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import { formatCurrency, formatDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, DollarSign, Download, Edit, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Expense {
    id: number;
    title: string;
    category_id: number;
    amount: number;
    expense_date: string;
    payment_method: string;
    reference_no?: string;
    notes?: string;
    category?: Category;
}

interface Props {
    expenses: {
        data: Expense[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
    };
    categories: Category[];
    currency: string;
    totalCost: number;
    totalExpensesThisMonth: number;
    filters: {
        search?: string;
        category_id?: string;
        from_date?: string;
        to_date?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Bills & Expenses', href: '/admin/expenses' },
];

export default function ExpensesIndex({ expenses, categories, currency, totalCost, totalExpensesThisMonth, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const form = useForm({
        title: '',
        category_id: categories[0]?.id || '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_no: '',
        notes: '',
    });

    const openCreateModal = () => {
        setEditingExpense(null);
        form.reset();
        setShowModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        form.setData({
            title: expense.title,
            category_id: expense.category_id,
            amount: expense.amount,
            expense_date: expense.expense_date,
            payment_method: expense.payment_method,
            reference_no: expense.reference_no || '',
            notes: expense.notes || '',
        });
        setShowModal(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            form.put(`/admin/expenses/${editingExpense.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('Operational expense updated!', 'success');
                },
            });
        } else {
            form.post('/admin/expenses', {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('New operational expense logged!', 'success');
                },
            });
        }
    };

    const handleDelete = async (expense: Expense) => {
        const confirmed = await showConfirm(`Delete expense "${expense.title}"?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/admin/expenses/${expense.id}`, {
                onSuccess: () => showToast('Expense deleted', 'success'),
            });
        }
    };

    const applySearchFilters = () => {
        router.get(
            '/admin/expenses',
            {
                search,
                category_id: categoryId,
                from_date: fromDate,
                to_date: toDate,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setFromDate('');
        setToDate('');
        router.get('/admin/expenses', {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bills & Expenses" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <DollarSign className="h-6 w-6 text-amber-500" /> Bills & Expenses
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Record and track non-ingredient operational overhead (rent, electricity, gas, internet, marketing, repairs)
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (search) params.set('search', search);
                                if (categoryId) params.set('category_id', categoryId);
                                if (fromDate) params.set('from_date', fromDate);
                                if (toDate) params.set('to_date', toDate);
                                window.location.href = `/admin/expenses/export-excel?${params.toString()}`;
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                        >
                            <Plus className="h-4 w-4" /> Log Expense Entry
                        </button>
                    </div>
                </div>

                {/* Monthly Overhead Card */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Overhead Expenses (This Month)</span>
                        <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                            {formatCurrency(totalExpensesThisMonth, currency)}
                        </div>
                    </div>
                </div>

                {/* Date Range Search & Filter Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {/* Search Title / Ref */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search expense description or reference..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applySearchFilters()}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Expense Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                title="From Date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        {/* To Date */}
                        <div className="relative">
                            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                title="To Date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            onClick={resetFilters}
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={applySearchFilters}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400"
                        >
                            <Filter className="h-3.5 w-3.5" /> Search
                        </button>
                    </div>
                </div>

                {/* Expense Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Expense Description</th>
                                    <th className="p-3.5">Category</th>
                                    <th className="p-3.5">Date</th>
                                    <th className="p-3.5">Payment Method</th>
                                    <th className="p-3.5 text-right">Amount</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {expenses.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No operational expenses logged yet matching filters.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.data.map((e) => (
                                        <tr key={e.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{e.title}</td>
                                            <td className="p-3.5">{e.category?.name ?? 'General'}</td>
                                            <td className="p-3.5 text-slate-600 dark:text-slate-300">{formatDate(e.expense_date)}</td>
                                            <td className="p-3.5 font-semibold text-slate-800 uppercase dark:text-slate-200">{e.payment_method}</td>
                                            <td className="p-3.5 text-right font-extrabold text-rose-600 dark:text-rose-400">
                                                {formatCurrency(e.amount, currency)}
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(e)}
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(e)}
                                                        className="rounded-lg bg-rose-500/10 p-1.5 text-rose-500 hover:bg-rose-500 hover:text-white"
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

                    {/* Bottom Summary Bar showing Filtered Total Cost */}
                    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3 font-bold sm:flex-row dark:border-slate-800 dark:bg-slate-950/80">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Total Expense Cost within Search Filters:</span>
                        <span className="text-base text-rose-600 dark:text-rose-400">{formatCurrency(totalCost, currency)}</span>
                    </div>

                    {/* Pagination Controls */}
                    <Pagination links={expenses.links} from={expenses.from} to={expenses.to} total={expenses.total} />
                </div>

                {/* Create / Edit Expense Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingExpense ? 'Edit Operational Expense' : 'Log New Operational Expense'}
                            </h3>

                            <form onSubmit={submitForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Expense Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Monthly Electricity Bill"
                                        value={form.data.title}
                                        onChange={(e) => form.setData('title', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Category *</label>
                                        <select
                                            value={form.data.category_id}
                                            onChange={(e) => form.setData('category_id', parseInt(e.target.value))}
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
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Amount ({currency}) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={form.data.amount}
                                            onChange={(e) => form.setData('amount', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 font-bold text-rose-500 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Expense Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={form.data.expense_date}
                                            onChange={(e) => form.setData('expense_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Payment Method</label>
                                        <select
                                            value={form.data.payment_method}
                                            onChange={(e) => form.setData('payment_method', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card / Bank</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                    >
                                        Save Expense
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
