import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate, showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Eye, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
    id: number;
    name: string;
}

interface InventoryItem {
    id: number;
    name: string;
    unit: string;
    cost_per_unit: number;
}

interface PurchaseItem {
    id?: number;
    inventory_item_id: number;
    inventoryItem?: InventoryItem;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
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
        total: number;
    };
    suppliers: Supplier[];
    inventoryItems: InventoryItem[];
    currency: string;
    filters: {
        status?: string;
        supplier_id?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Purchases & PO Entry', href: '/admin/purchases' },
];

export default function PurchasesIndex({ purchases, suppliers, inventoryItems, currency, filters }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);

    // Purchase Order Entry Form
    const poForm = useForm({
        supplier_id: '' as number | string,
        supplier_name_text: '',
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'received',
        notes: '',
        items: [] as {
            inventory_item_id: number;
            quantity: number;
            unit: string;
            unit_price: number;
            total_price: number;
        }[],
    });

    const openCreateModal = () => {
        poForm.reset();
        poForm.setData({
            supplier_id: '',
            supplier_name_text: '',
            purchase_date: new Date().toISOString().split('T')[0],
            status: 'received',
            notes: '',
            items: [
                {
                    inventory_item_id: inventoryItems[0]?.id || 0,
                    quantity: 1,
                    unit: inventoryItems[0]?.unit || 'kg',
                    unit_price: inventoryItems[0]?.cost_per_unit || 0,
                    total_price: inventoryItems[0]?.cost_per_unit || 0,
                },
            ],
        });
        setShowCreateModal(true);
    };

    const addLineItem = () => {
        const firstInv = inventoryItems[0];
        poForm.setData('items', [
            ...poForm.data.items,
            {
                inventory_item_id: firstInv?.id || 0,
                quantity: 1,
                unit: firstInv?.unit || 'kg',
                unit_price: firstInv?.cost_per_unit || 0,
                total_price: firstInv?.cost_per_unit || 0,
            },
        ]);
    };

    const removeLineItem = (index: number) => {
        const newItems = [...poForm.data.items];
        newItems.splice(index, 1);
        poForm.setData('items', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...poForm.data.items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'inventory_item_id') {
            const selectedInv = inventoryItems.find((i) => i.id === Number(value));
            if (selectedInv) {
                newItems[index].unit = selectedInv.unit;
                newItems[index].unit_price = selectedInv.cost_per_unit;
                newItems[index].total_price = selectedInv.cost_per_unit * newItems[index].quantity;
            }
        } else if (field === 'quantity' || field === 'unit_price') {
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
        poForm.post('/admin/purchases', {
            onSuccess: () => {
                setShowCreateModal(false);
                showToast('Purchase Order saved & raw stock restocked!', 'success');
            },
        });
    };

    const handleToggleStatus = (purchase: Purchase, newStatus: string) => {
        router.post(
            `/admin/purchases/${purchase.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => showToast(`Purchase Order status updated to ${newStatus}`, 'success'),
            },
        );
    };

    const handleDeletePO = async (purchase: Purchase) => {
        const confirmed = await showConfirm(`Delete Purchase Order #${purchase.purchase_number}?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/admin/purchases/${purchase.id}`, {
                onSuccess: () => showToast(`Purchase Order deleted`, 'success'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Procurement & Daily Purchases" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <ShoppingBag className="h-6 w-6 text-amber-500" /> Procurements & Daily Bazar Entry
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Record daily raw ingredient purchases from registered vendors or local markets
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
                    >
                        <Plus className="h-4 w-4" /> Create Purchase Order
                    </button>
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
                                            No purchase records entered yet.
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.data.map((p) => (
                                        <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">#{p.purchase_number}</td>
                                            <td className="p-3.5">
                                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {p.supplier?.name || p.supplier_name_text || 'Local Market / Bazar'}
                                                </div>
                                                <span className="text-[10px] text-slate-400">{p.items?.length || 0} line items</span>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    {p.status !== 'received' && (
                                                        <button
                                                            onClick={() => handleToggleStatus(p, 'received')}
                                                            title="Mark as Received & Restock"
                                                            className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:text-emerald-400"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setViewingPurchase(p)}
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePO(p)}
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
                </div>

                {/* Create PO Entry Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create New Purchase Order / Bazar Entry</h3>

                            <form onSubmit={submitPOForm} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Registered Supplier</label>
                                        <select
                                            value={poForm.data.supplier_id}
                                            onChange={(e) => poForm.setData('supplier_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value="">-- None (Local Bazar) --</option>
                                            {suppliers.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">
                                            Or Local Vendor / Market Name
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

                                {/* Line Items */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">Raw Ingredient Line Items</span>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add Item
                                        </button>
                                    </div>

                                    {poForm.data.items.map((row, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950"
                                        >
                                            <div className="col-span-4">
                                                <label className="mb-1 block text-[10px] text-slate-400">Ingredient</label>
                                                <select
                                                    value={row.inventory_item_id}
                                                    onChange={(e) => handleItemChange(idx, 'inventory_item_id', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                >
                                                    {inventoryItems.map((inv) => (
                                                        <option key={inv.id} value={inv.id}>
                                                            {inv.name} ({inv.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="mb-1 block text-[10px] text-slate-400">Quantity</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={row.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                            </div>

                                            <div className="col-span-3">
                                                <label className="mb-1 block text-[10px] text-slate-400">Unit Price ({currency})</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={row.unit_price}
                                                    onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <label className="mb-1 block text-[10px] text-slate-400">Total</label>
                                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                                    {formatCurrency(row.total_price, currency)}
                                                </span>
                                            </div>

                                            <div className="col-span-1 pt-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(idx)}
                                                    className="text-rose-500 hover:text-rose-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
                                            onClick={() => setShowCreateModal(false)}
                                            className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={poForm.processing}
                                            className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400"
                                        >
                                            Save & Restock Inventory
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

                            <div className="space-y-2 text-xs">
                                <p className="text-slate-600 dark:text-slate-300">
                                    <strong>Vendor:</strong> {viewingPurchase.supplier?.name || viewingPurchase.supplier_name_text || 'Local Market'}
                                </p>
                                <div className="space-y-2 pt-2">
                                    <span className="block font-bold text-slate-800 dark:text-slate-200">Items Purchased:</span>
                                    {viewingPurchase.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between rounded bg-slate-100 p-2 dark:bg-slate-950">
                                            <span>
                                                {item.inventoryItem?.name || 'Raw Ingredient'} ({item.quantity} {item.unit})
                                            </span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                                {formatCurrency(item.total_price, currency)}
                                            </span>
                                        </div>
                                    ))}
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
