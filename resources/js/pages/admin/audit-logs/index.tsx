import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Download, FilterX, History, RotateCcw, Search, Shield } from 'lucide-react';
import { useState } from 'react';

interface AuditLogItem {
    id: number;
    user_name?: string;
    action: string;
    module: string;
    ip_address?: string;
    details?: string;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    logs: {
        data: AuditLogItem[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        per_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        module?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
    };
    modules?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Audit Logs', href: '/admin/audit-logs' },
];

export default function AuditLogsIndex({ logs, filters, modules = [] }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedModule, setSelectedModule] = useState(filters?.module || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [perPage, setPerPage] = useState(filters?.per_page || 20);

    const getTodayString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleFilter = () => {
        router.get(
            '/admin/audit-logs',
            {
                search,
                module: selectedModule,
                start_date: startDate,
                end_date: endDate,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleTodayFilter = () => {
        const today = getTodayString();
        setStartDate(today);
        setEndDate(today);
        router.get(
            '/admin/audit-logs',
            {
                search,
                module: selectedModule,
                start_date: today,
                end_date: today,
                per_page: perPage,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedModule('');
        setStartDate('');
        setEndDate('');
        router.get('/admin/audit-logs', { per_page: perPage }, { preserveState: true, preserveScroll: true });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            '/admin/audit-logs',
            {
                search,
                module: selectedModule,
                start_date: startDate,
                end_date: endDate,
                per_page: newPerPage,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const isFiltered = Boolean(search || selectedModule || startDate || endDate);
    const todayStr = getTodayString();
    const isTodayActive = startDate === todayStr && endDate === todayStr;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Security Audit Trail Logs" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-4 text-slate-900 transition-colors md:p-6 dark:bg-slate-950 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            <History className="h-6 w-6 text-amber-500" /> Administrative Audit Activity Log
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Immutable audit trail of administrative modifications, inventory adjustments, and login sessions
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (search) params.set('search', search);
                                if (selectedModule) params.set('module', selectedModule);
                                if (startDate) params.set('start_date', startDate);
                                if (endDate) params.set('end_date', endDate);
                                window.location.href = `/admin/audit-logs/export-excel?${params.toString()}`;
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition-all hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Download className="h-4 w-4" /> Export Excel (.xlsx)
                        </button>
                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Shield className="h-3.5 w-3.5" /> Immutable Security Trail
                        </span>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
                        {/* Search Input */}
                        <div className="relative lg:col-span-4">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search action, admin, details or IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 py-2 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        {/* Module Dropdown */}
                        <div className="lg:col-span-2">
                            <select
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            >
                                <option value="">All Modules</option>
                                {modules.map((m) => (
                                    <option key={m} value={m}>
                                        {m.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Start */}
                        <div className="lg:col-span-2">
                            <input
                                type="date"
                                title="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        {/* Date Range End */}
                        <div className="lg:col-span-2">
                            <input
                                type="date"
                                title="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-900 focus:border-amber-500/50 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                            />
                        </div>

                        {/* Today Quick Filter Button */}
                        <div className="flex items-center gap-2 lg:col-span-2">
                            <button
                                type="button"
                                onClick={handleTodayFilter}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                                    isTodayActive
                                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                                        : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400'
                                }`}
                                title="Show Today's Audit Activity Logs Only"
                            >
                                <Calendar className="h-3.5 w-3.5" /> Today
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/60">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isFiltered ? (
                                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                    Filters active • Showing matching audit logs (latest first)
                                </span>
                            ) : (
                                <span>Showing all audit logs (latest first)</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isFiltered && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-1 rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                                </button>
                            )}
                            <button
                                onClick={handleFilter}
                                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                <tr>
                                    <th className="p-3.5">Timestamp</th>
                                    <th className="p-3.5">Admin User</th>
                                    <th className="p-3.5">Module</th>
                                    <th className="p-3.5">Action Executed</th>
                                    <th className="p-3.5">IP Address</th>
                                    <th className="p-3.5">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FilterX className="h-8 w-8 text-slate-400" />
                                                <p className="font-semibold text-slate-700 dark:text-slate-300">No audit activity logs found</p>
                                                <p className="text-xs text-slate-400">
                                                    {isFiltered ? 'Try clearing your date range or search filters.' : 'No audit activity logs recorded yet.'}
                                                </p>
                                                {isFiltered && (
                                                    <button
                                                        onClick={handleReset}
                                                        className="mt-2 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-500 hover:text-slate-950 dark:text-amber-400"
                                                    >
                                                        Clear Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                                {formatDateTime(log.created_at)}
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{log.user_name || 'System'}</td>
                                            <td className="p-3.5 font-semibold uppercase text-amber-600 dark:text-amber-400">{log.module}</td>
                                            <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">{log.action}</td>
                                            <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{log.ip_address || '-'}</td>
                                            <td className="max-w-sm truncate p-3.5 text-slate-500 dark:text-slate-400" title={log.details || ''}>
                                                {log.details || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {logs.total > 0 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/50 p-4 text-xs sm:flex-row dark:border-slate-800 dark:bg-slate-950/50">
                            {/* Summary & Per Page Selector */}
                            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                                <span>
                                    Showing <span className="font-bold text-slate-900 dark:text-slate-100">{logs.from || 0}</span> to{' '}
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{logs.to || 0}</span> of{' '}
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{logs.total}</span> logs
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <label className="text-[11px]">Per page:</label>
                                    <select
                                        value={perPage}
                                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Page Links */}
                            {logs.links && logs.links.length > 3 && (
                                <div className="flex flex-wrap items-center gap-1">
                                    {logs.links.map((link, idx) => {
                                        let label = link.label;
                                        if (label.includes('&laquo;') || label.includes('Previous')) {
                                            label = 'Prev';
                                        } else if (label.includes('&raquo;') || label.includes('Next')) {
                                            label = 'Next';
                                        }

                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="cursor-not-allowed rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 opacity-50 dark:text-slate-600"
                                                    dangerouslySetInnerHTML={{ __html: label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                                    link.active
                                                        ? 'bg-amber-500 font-bold text-slate-950 shadow-sm'
                                                        : 'bg-white text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
