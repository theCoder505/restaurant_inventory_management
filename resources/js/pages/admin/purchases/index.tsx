import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import { formatCurrency, formatDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Calendar, Edit, Eye, Filter, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
    id: number;
    name: string;
}

interface PurchaseItem {
    id?: number;
    ingredient_name: string;
    quantity: number;
    used_amount: number;
    unit: string;
    unit_price: number;
    total_price: number;
    expiry_date?: string;
}

interface Purchase {
    id: number;
    purchase_number: string;
    supplier_id?: number;
    supplier_name_text?: string;
    purchase_date: string;
    status: 'draft' | 'pending' | 'approved' | 'received';
    total_amount: number;
    notes?: string;
    supplier?: Supplier;
    items: PurchaseItem[];
}

interface Props {
    purchases: {
        data: Purchase[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
    };
    suppliers: Supplier[];
    currency: string;
    totalCost: number;
    expiryThreshold: number;
    filters: {
        search?: string;
        from_date?: string;
        to_date?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Purchases & PO Entry', href: '/admin/purchases' },
];

export default function PurchasesIndex({ purchases, suppliers, currency, totalCost, expiryThreshold, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
    const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [status, setStatus] = useState(filters.status || '');

    // Purchase Order Form
    const poForm = useForm({
        supplier_id: '' as number | string,
        supplier_name_text: '',
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'received',
        notes: '',
        items: [
            {
                ingredient_name: '',
                quantity: 1,
                used_amount: 0,
                unit: 'kg',
                unit_price: 0,
                total_price: 0,
                expiry_date: '',
            },
        ] as {
            ingredient_name: string;
            quantity: number;
            used_amount: number;
            unit: string;
            unit_price: number;
            total_price: number;
            expiry_date?: string;
        }[],
    });

    const openCreateModal = () => {
        setEditingPurchase(null);
        poForm.reset();
        poForm.setData({
            supplier_id: '',
            supplier_name_text: '',
            purchase_date: new Date().toISOString().split('T')[0],
            status: 'received',
            notes: '',
            items: [
                {
                    ingredient_name: '',
                    quantity: 1,
                    used_amount: 0,
                    unit: 'kg',
                    unit_price: 0,
                    total_price: 0,
                    expiry_date: '',
                },
            ],
        });
        setShowModal(true);
    };

    const openEditModal = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        const formattedPurchaseDate = purchase.purchase_date
            ? String(purchase.purchase_date).split('T')[0].split(' ')[0]
            : new Date().toISOString().split('T')[0];

        poForm.setData({
            supplier_id: purchase.supplier_id || '',
            supplier_name_text: purchase.supplier_name_text || '',
            purchase_date: formattedPurchaseDate,
            status: purchase.status,
            notes: purchase.notes || '',
            items: purchase.items.map((item) => ({
                ingredient_name: item.ingredient_name || '',
                quantity: item.quantity,
                used_amount: item.used_amount || 0,
                unit: item.unit || 'kg',
                unit_price: item.unit_price,
                total_price: item.total_price,
                expiry_date: item.expiry_date ? String(item.expiry_date).split('T')[0].split(' ')[0] : '',
            })),
        });
        setShowModal(true);
    };

    const addLineItem = () => {
        poForm.setData('items', [
            ...poForm.data.items,
            {
                ingredient_name: '',
                quantity: 1,
                used_amount: 0,
                unit: 'kg',
                unit_price: 0,
                total_price: 0,
                expiry_date: '',
            },
        ]);
    };

    const removeLineItem = (index: number) => {
        if (poForm.data.items.length <= 1) return;
        const newItems = [...poForm.data.items];
        newItems.splice(index, 1);
        poForm.setData('items', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...poForm.data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'unit_price') {
            const q = Number(newItems[index].quantity) || 0;
            const p = Number(newItems[index].unit_price) || 0;
            newItems[index].total_price = q * p;
        }

        poForm.setData('items', newItems);
    };

    const calculateTotalPOAmount = () => {
        return poForm.data.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    };

    const submitPOForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPurchase) {
            poForm.put(`/admin/purchases/${editingPurchase.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('Purchase Order updated successfully!', 'success');
                },
            });
        } else {
            poForm.post('/admin/purchases', {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('New Purchase Order saved successfully!', 'success');
                },
            });
        }
    };

    const handleDeletePO = async (purchase: Purchase) => {
        const confirmed = await showConfirm(`Delete Purchase Order #${purchase.purchase_number}?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/admin/purchases/${purchase.id}`, {
                onSuccess: () => showToast('Purchase Order deleted', 'success'),
            });
        }
    };

    const applySearchFilters = () => {
        router.get(
            '/admin/purchases',
            {
                search,
                from_date: fromDate,
                to_date: toDate,
                status,
            },
            { preserveState: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        setStatus('');
        router.get('/admin/purchases', {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchases & PO Entry" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <ShoppingBag className="h-6 w-6 text-amber-500" /> Purchases & PO Entry
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Record and manage raw ingredient purchases from local markets or registered suppliers
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                    >
                        <Plus className="h-4 w-4" /> Create Purchase Order
                    </button>
                </div>

                {/* Filter & Date Range Search Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search PO #, market or item..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applySearchFilters()}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
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

                        {/* Status Filter */}
                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Statuses</option>
                                <option value="received">Received</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="draft">Draft</option>
                            </select>
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

                {/* Purchase List Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">PO Number</th>
                                    <th className="p-3.5">Supplier / Market</th>
                                    <th className="p-3.5">Purchase Date</th>
                                    <th className="p-3.5 text-right">Total Amount</th>
                                    <th className="p-3.5 text-center">Status</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {purchases.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No purchase records found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.data.map((p) => {
                                        const itemCount = p.items?.length || 0;
                                        const hasWarningItem = p.items?.some(
                                            (it) => it.quantity > 0 && (it.used_amount / it.quantity) * 100 >= expiryThreshold,
                                        );

                                        return (
                                            <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <td className="p-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">#{p.purchase_number}</span>
                                                        {hasWarningItem && (
                                                            <span title={`Contains items used >= ${expiryThreshold}%`} className="text-amber-500">
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {p.supplier?.name || p.supplier_name_text || 'Local Market / Bazar'}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">
                                                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{formatDate(p.purchase_date)}</td>
                                                <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100">
                                                    {formatCurrency(p.total_amount, currency)}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                            p.status === 'received'
                                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : p.status === 'approved'
                                                                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                                                                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                        }`}
                                                    >
                                                        {p.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setViewingPurchase(p)}
                                                            title="View Details"
                                                            className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(p)}
                                                            title="Edit Purchase Order"
                                                            className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400 dark:hover:text-amber-50"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePO(p)}
                                                            title="Delete Purchase Order"
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

                    {/* Bottom Summary Bar showing Filtered Total Cost */}
                    <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-3 font-bold sm:flex-row dark:border-slate-800 dark:bg-slate-950/80">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Total Purchase Cost within Search Filters:</span>
                        <span className="text-base text-amber-600 dark:text-amber-400">{formatCurrency(totalCost, currency)}</span>
                    </div>

                    {/* Pagination Controls */}
                    <Pagination links={purchases.links} from={purchases.from} to={purchases.to} total={purchases.total} />
                </div>

                {/* Create / Edit PO Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingPurchase ? `Edit Purchase Order #${editingPurchase.purchase_number}` : 'Create New Purchase Order / Bazar Entry'}
                            </h3>

                            <form onSubmit={submitPOForm} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Registered Supplier</label>
                                        <select
                                            value={poForm.data.supplier_id}
                                            onChange={(e) => poForm.setData('supplier_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="">-- None (Dynamic Market) --</option>
                                            {suppliers.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Or Supplier / Market Name (Dynamic)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Gulshan Kacha Bazar"
                                            value={poForm.data.supplier_name_text}
                                            onChange={(e) => poForm.setData('supplier_name_text', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Purchase Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={poForm.data.purchase_date}
                                            onChange={(e) => poForm.setData('purchase_date', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Ingredient Line Items */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">Raw Ingredient Items</span>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add Ingredient Item
                                        </button>
                                    </div>

                                    {poForm.data.items.map((row, idx) => {
                                        const usedPct = row.quantity > 0 ? (row.used_amount / row.quantity) * 100 : 0;
                                        const isHighUsage = usedPct >= expiryThreshold;

                                        return (
                                            <div
                                                key={idx}
                                                className={`grid grid-cols-12 items-center gap-2 rounded-xl border p-3 ${
                                                    isHighUsage
                                                        ? 'border-amber-500/50 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20'
                                                        : 'border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950'
                                                }`}
                                            >
                                                {/* Ingredient Name Input */}
                                                <div className="col-span-3">
                                                    <label className="mb-1 block text-[10px] text-slate-400">Ingredient Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Fresh Chicken"
                                                        value={row.ingredient_name}
                                                        onChange={(e) => handleItemChange(idx, 'ingredient_name', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                    />
                                                </div>

                                                {/* Quantity */}
                                                <div className="col-span-2">
                                                    <label className="mb-1 block text-[10px] text-slate-400">Quantity *</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        required
                                                        value={row.quantity}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                    />
                                                </div>

                                                {/* Used Amount */}
                                                <div className="col-span-2">
                                                    <label className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
                                                        <span>Used Amount</span>
                                                        <span className={isHighUsage ? 'font-bold text-amber-500' : ''}>{usedPct.toFixed(0)}%</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={row.used_amount}
                                                        onChange={(e) => handleItemChange(idx, 'used_amount', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                    />
                                                </div>

                                                {/* Unit */}
                                                <div className="col-span-1">
                                                    <label className="mb-1 block text-[10px] text-slate-400">Unit</label>
                                                    <input
                                                        type="text"
                                                        placeholder="kg"
                                                        value={row.unit}
                                                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-1.5 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                    />
                                                </div>

                                                {/* Unit Price */}
                                                <div className="col-span-2">
                                                    <label className="mb-1 block text-[10px] text-slate-400">Unit Price ({currency})</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={row.unit_price}
                                                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                    />
                                                </div>

                                                {/* Total & Action */}
                                                <div className="col-span-2 text-right">
                                                    <label className="mb-1 block text-[10px] text-slate-400">Total</label>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="font-bold text-amber-600 dark:text-amber-400">
                                                            {formatCurrency(row.total_price, currency)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLineItem(idx)}
                                                            className="text-rose-500 hover:text-rose-400 disabled:opacity-30"
                                                            disabled={poForm.data.items.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        Total PO Amount:{' '}
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {formatCurrency(calculateTotalPOAmount(), currency)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={poForm.processing}
                                            className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                        >
                                            {editingPurchase ? 'Save Changes' : 'Save Purchase Order'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Purchase Order Details Modal */}
                {viewingPurchase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        Purchase Order #{viewingPurchase.purchase_number}
                                    </h3>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Date: {formatDate(viewingPurchase.purchase_date)}</span>
                                </div>
                                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {viewingPurchase.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <p className="text-slate-600 dark:text-slate-300">
                                    <strong>Supplier / Market:</strong> {viewingPurchase.supplier?.name || viewingPurchase.supplier_name_text || 'Local Market'}
                                </p>
                                <div className="space-y-2 pt-1">
                                    <span className="block font-bold text-slate-800 dark:text-slate-200">
                                        Items ({viewingPurchase.items?.length || 0} {viewingPurchase.items?.length === 1 ? 'Item' : 'Items'}):
                                    </span>
                                    {viewingPurchase.items.map((item, idx) => {
                                        const usedPct = item.quantity > 0 ? (item.used_amount / item.quantity) * 100 : 0;
                                        const isWarning = usedPct >= expiryThreshold;

                                        return (
                                            <div key={idx} className="space-y-1 rounded border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-950">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {item.ingredient_name || 'Ingredient Item'} ({item.quantity} {item.unit})
                                                    </span>
                                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                                        {formatCurrency(item.total_price, currency)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                                    <span>Used: {item.used_amount} {item.unit} ({usedPct.toFixed(0)}%)</span>
                                                    {isWarning && (
                                                        <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                                                            <AlertTriangle className="h-3 w-3" /> Expiry / High Usage Warning
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                    Grand Total: {formatCurrency(viewingPurchase.total_amount, currency)}
                                </span>
                                <button
                                    onClick={() => setViewingPurchase(null)}
                                    className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
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
