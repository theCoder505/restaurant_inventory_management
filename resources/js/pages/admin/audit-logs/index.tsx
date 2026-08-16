import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/swal';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { History, Shield } from 'lucide-react';

interface AuditLogItem {
    id: number;
    user_name?: string;
    action: string;
    module: string;
    ip_address?: string;
    details?: string;
    created_at: string;
}

interface Props {
    logs: {
        data: AuditLogItem[];
        links: any[];
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Audit Logs', href: '/admin/audit-logs' },
];

export default function AuditLogsIndex({ logs }: Props) {
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
                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Shield className="h-3.5 w-3.5" /> Immutable Security Trail
                        </span>
                    </div>
                </div>

                {/* Audit Log Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase dark:bg-slate-950 dark:text-slate-400">
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
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No audit activity logs recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                                {formatDateTime(log.created_at)}
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{log.user_name || 'System'}</td>
                                            <td className="p-3.5 font-semibold text-amber-600 uppercase dark:text-amber-400">{log.module}</td>
                                            <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">{log.action}</td>
                                            <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{log.ip_address || '-'}</td>
                                            <td className="max-w-sm truncate p-3.5 text-slate-500 dark:text-slate-400">{log.details || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
