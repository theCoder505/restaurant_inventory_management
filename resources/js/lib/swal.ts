import Swal from 'sweetalert2';

export function formatCurrency(amount: number | string, currency = '৳'): string {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `${num.toFixed(2)} ${currency}`;
}

export function formatDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export function formatHumanDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const target = new Date(date);
        target.setHours(0, 0, 0, 0);

        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return `Today (${formatted})`;
        if (diffDays === 1) return `Tomorrow (${formatted})`;
        if (diffDays === -1) return `Yesterday (${formatted})`;
        if (diffDays > 0 && diffDays <= 14) return `In ${diffDays} days (${formatted})`;

        return formatted;
    } catch {
        return dateString;
    }
}

export function formatDateTime(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
}

export function showToast(title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    Toast.fire({
        icon,
        title,
    });
}

export function showAlert(title: string, text?: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
    return Swal.fire({
        title,
        text,
        icon,
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#f59e0b',
    });
}

export async function showConfirm(title: string, text?: string, confirmButtonText = 'Yes, proceed!'): Promise<boolean> {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText,
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    });

    return result.isConfirmed;
}

export async function confirmAction(
    title: string,
    text?: string,
    confirmButtonText = 'Yes, proceed!',
    onConfirm?: () => void,
): Promise<boolean> {
    const isConfirmed = await showConfirm(title, text, confirmButtonText);
    if (isConfirmed && onConfirm) {
        onConfirm();
    }
    return isConfirmed;
}
