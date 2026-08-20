import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
    from?: number;
    to?: number;
    total?: number;
    className?: string;
}

export default function Pagination({ links, from, to, total, className = '' }: PaginationProps) {
    if (!links || links.length <= 1) return null;

    return (
        <div className={`flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 sm:flex-row dark:border-slate-800 ${className}`}>
            {total !== undefined && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold text-slate-900 dark:text-slate-100">{from ?? 0}</span> to{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{to ?? 0}</span> of{' '}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{total}</span> entries
                </div>
            )}

            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, key) => {
                    // Clean HTML entities in label like &laquo; or &raquo;
                    const labelText = link.label
                        .replace('&laquo; Previous', '')
                        .replace('Next &raquo;', '')
                        .replace('&laquo;', '«')
                        .replace('&raquo;', '»');

                    const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    if (link.url === null) {
                        return (
                            <span
                                key={key}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-600"
                            >
                                {isPrevious ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : labelText}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={key}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={`inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                link.active
                                    ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                        >
                            {isPrevious ? (
                                <span className="flex items-center gap-1">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                </span>
                            ) : isNext ? (
                                <span className="flex items-center gap-1">
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                            ) : (
                                labelText
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
