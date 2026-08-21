import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/pagination';
import { showConfirm, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Download, Edit, Plus, Search, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';

interface Supplier {
    id: number;
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    purchases_count?: number;
}

interface Props {
    suppliers: {
        data: Supplier[];
        links: any[];
        from?: number;
        to?: number;
        total: number;
    };
    currency: string;
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Suppliers & Vendors', href: '/administration-control/suppliers' },
];

export default function SuppliersIndex({ suppliers, currency, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // Search filter state
    const [search, setSearch] = useState(filters.search || '');

    const form = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });

    const openCreateModal = () => {
        setEditingSupplier(null);
        form.reset();
        setShowModal(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        form.setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
        });
        setShowModal(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            form.put(`/administration-control/suppliers/${editingSupplier.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('Supplier details updated!', 'success');
                },
            });
        } else {
            form.post('/administration-control/suppliers', {
                onSuccess: () => {
                    setShowModal(false);
                    showToast('New vendor / supplier registered!', 'success');
                },
            });
        }
    };

    const handleDelete = async (supplier: Supplier) => {
        const confirmed = await showConfirm(`Delete supplier "${supplier.name}"?`, 'Action cannot be undone.');
        if (confirmed) {
            router.delete(`/administration-control/suppliers/${supplier.id}`, {
                onSuccess: () => showToast(`Supplier deleted`, 'success'),
            });
        }
    };

    const applySearch = () => {
        router.get('/administration-control/suppliers', { search }, { preserveState: true });
    };

    const resetSearch = () => {
        setSearch('');
        router.get('/administration-control/suppliers', {}, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        window.location.href = `/administration-control/suppliers/export-excel?${params.toString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier Directory & Vendor History" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 transition-colors overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Truck className="h-6 w-6 text-amber-500" /> Supplier Directory & Vendor Management
                        </h1>
                        <p className="mt-1 font-sans text-xs text-slate-500 dark:text-slate-400">
                            Registered raw food suppliers, contact info, and purchase order histories
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 font-sans text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-sans text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> Add New Supplier
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search suppliers by name, contact person, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                            className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-10 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetSearch}
                            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                            Reset
                        </button>
                        <button
                            onClick={applySearch}
                            className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Supplier Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Vendor Name</th>
                                    <th className="p-3.5">Contact Person</th>
                                    <th className="p-3.5">Phone & Email</th>
                                    <th className="p-3.5">Address</th>
                                    <th className="p-3.5 text-center">Total Orders</th>
                                    <th className="p-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {suppliers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No suppliers found.
                                        </td>
                                    </tr>
                                ) : (
                                    suppliers.data.map((s) => (
                                        <tr key={s.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 font-display font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                                            <td className="p-3.5">{s.contact_person || '-'}</td>
                                            <td className="p-3.5">
                                                <div>{s.phone || '-'}</div>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{s.email}</span>
                                            </td>
                                            <td className="max-w-xs truncate p-3.5 text-slate-500 dark:text-slate-400">{s.address || '-'}</td>
                                            <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                                                {s.purchases_count || 0} POs
                                            </td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(s)}
                                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s)}
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

                    {/* Pagination Controls */}
                    <Pagination links={suppliers.links} from={suppliers.from} to={suppliers.to} total={suppliers.total} />
                </div>

                {/* Create / Edit Supplier Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editingSupplier ? 'Edit Vendor Supplier' : 'Register New Vendor Supplier'}
                            </h3>

                            <form onSubmit={submitForm} className="space-y-4 text-xs">
                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Company / Vendor Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Contact Person</label>
                                        <input
                                            type="text"
                                            value={form.data.contact_person}
                                            onChange={(e) => form.setData('contact_person', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
                                        <input
                                            type="text"
                                            value={form.data.phone}
                                            onChange={(e) => form.setData('phone', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Address</label>
                                    <textarea
                                        rows={2}
                                        value={form.data.address}
                                        onChange={(e) => form.setData('address', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
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
                                        Save Supplier
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
