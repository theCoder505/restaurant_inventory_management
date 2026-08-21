import AppLayout from '@/layouts/app-layout';
import { confirmAction, showToast } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Check, Edit, Loader2, Plus, Quote, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface ReviewItem {
    id: number;
    customer_name: string;
    customer_title?: string;
    avatar_initials?: string;
    avatar_url?: string;
    rating: number;
    comment: string;
    is_active: boolean;
    order_index: number;
}

type ReviewFormData = {
    customer_name: string;
    customer_title: string;
    avatar_initials: string;
    rating: number;
    comment: string;
    is_active: boolean;
    order_index: number;
};

interface Props {
    reviews: ReviewItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/administration-control/dashboard' },
    { title: 'Customer Reviews Management', href: '/administration-control/reviews' },
];

export default function ReviewsIndex({ reviews }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const createForm = useForm<ReviewFormData>({
        customer_name: '',
        customer_title: 'Verified Diner • Night Owl',
        avatar_initials: '',
        rating: 5,
        comment: '',
        is_active: true,
        order_index: 0,
    });

    const editForm = useForm<ReviewFormData>({
        customer_name: '',
        customer_title: '',
        avatar_initials: '',
        rating: 5,
        comment: '',
        is_active: true,
        order_index: 0,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/administration-control/reviews', {
            onSuccess: () => {
                showToast('Review created successfully!', 'success');
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditStart = (review: ReviewItem) => {
        setEditingReview(review);
        editForm.setData({
            customer_name: review.customer_name,
            customer_title: review.customer_title || '',
            avatar_initials: review.avatar_initials || '',
            rating: review.rating,
            comment: review.comment,
            is_active: review.is_active,
            order_index: review.order_index,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReview) return;
        editForm.put(`/administration-control/reviews/${editingReview.id}`, {
            onSuccess: () => {
                showToast('Review updated successfully!', 'success');
                setEditingReview(null);
            },
        });
    };

    const handleDelete = (review: ReviewItem) => {
        confirmAction(
            `Delete Review from "${review.customer_name}"?`,
            'This action will permanently remove this customer feedback from the website.',
            'Yes, Delete',
            () => {
                setDeletingId(review.id);
                createForm.delete(`/administration-control/reviews/${review.id}`, {
                    onSuccess: () => showToast('Review deleted!', 'success'),
                    onFinish: () => setDeletingId(null),
                });
            },
        );
    };

    const handleToggleActive = (review: ReviewItem) => {
        setTogglingId(review.id);
        createForm.post(`/administration-control/reviews/${review.id}/toggle-active`, {
            onSuccess: () => showToast('Review status updated!', 'success'),
            onFinish: () => setTogglingId(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Customer Reviews" />

            <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col gap-6 bg-slate-50 p-3 sm:p-4 md:p-6 text-slate-900 overflow-x-hidden dark:bg-slate-950 dark:text-slate-100">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <Quote className="h-6 w-6 text-amber-500" /> Customer Reviews & Testimonials
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Manage testimonials and ratings displayed in the Swiper slider on the public website.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow transition-all hover:bg-amber-400 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Add New Review
                    </button>
                </div>

                {/* Create Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Customer Review</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Customer Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.data.customer_name}
                                            onChange={(e) => createForm.setData('customer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Tagline / Designation</label>
                                        <input
                                            type="text"
                                            value={createForm.data.customer_title}
                                            onChange={(e) => createForm.setData('customer_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Rating (1 - 5 Stars) *</label>
                                        <select
                                            value={createForm.data.rating}
                                            onChange={(e) => createForm.setData('rating', parseInt(e.target.value))}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value={5}>★★★★★ (5 Stars)</option>
                                            <option value={4}>★★★★☆ (4 Stars)</option>
                                            <option value={3}>★★★☆☆ (3 Stars)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Avatar Initials (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. JD"
                                            maxLength={4}
                                            value={createForm.data.avatar_initials}
                                            onChange={(e) => createForm.setData('avatar_initials', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Review Feedback / Comment *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={createForm.data.comment}
                                        onChange={(e) => createForm.setData('comment', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        disabled={createForm.processing}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {createForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Saving Review...</span>
                                            </>
                                        ) : (
                                            <span>Save Review</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Customer Review</h3>
                                <button onClick={() => setEditingReview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Customer Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.data.customer_name}
                                            onChange={(e) => editForm.setData('customer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Tagline / Designation</label>
                                        <input
                                            type="text"
                                            value={editForm.data.customer_title}
                                            onChange={(e) => editForm.setData('customer_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Rating (1 - 5 Stars) *</label>
                                        <select
                                            value={editForm.data.rating}
                                            onChange={(e) => editForm.setData('rating', parseInt(e.target.value))}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        >
                                            <option value={5}>★★★★★ (5 Stars)</option>
                                            <option value={4}>★★★★☆ (4 Stars)</option>
                                            <option value={3}>★★★☆☆ (3 Stars)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Avatar Initials</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={editForm.data.avatar_initials}
                                            onChange={(e) => editForm.setData('avatar_initials', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700 dark:text-slate-300">Testimonial Comment *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={editForm.data.comment}
                                        onChange={(e) => editForm.setData('comment', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingReview(null)}
                                        disabled={editForm.processing}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {editForm.processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Updating Review...</span>
                                            </>
                                        ) : (
                                            <span>Update Review</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className={`rounded-2xl border p-5 space-y-3 transition-all ${
                                rev.is_active
                                    ? 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
                                    : 'border-dashed border-slate-300 bg-slate-100 opacity-60 dark:border-slate-800 dark:bg-slate-950'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < rev.rating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-slate-700'
                                            }`}
                                        />
                                    ))}
                                    <span className="text-xs font-bold ml-1 text-slate-700 dark:text-slate-300">{rev.rating}.0</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(rev)}
                                        disabled={togglingId === rev.id}
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase disabled:opacity-50 cursor-pointer ${
                                            rev.is_active
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                    >
                                        {togglingId === rev.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                        <span>{rev.is_active ? 'Active' : 'Hidden'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleEditStart(rev)}
                                        className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rev)}
                                        disabled={deletingId === rev.id}
                                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                                        title="Delete"
                                    >
                                        {deletingId === rev.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs italic text-slate-700 dark:text-slate-300 line-clamp-3">
                                "{rev.comment}"
                            </p>

                            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white text-[10px]">
                                    {rev.avatar_initials || rev.customer_name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{rev.customer_name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{rev.customer_title || 'Customer'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
