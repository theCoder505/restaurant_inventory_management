import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Boxes, Home, LayoutDashboard, Search, Settings, ShoppingCart, UtensilsCrossed } from 'lucide-react';

interface Props {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 404, message }: Props) {
    const titleMap: Record<number, string> = {
        404: 'Page Not Found in the Pantry',
        500: 'Internal Kitchen Error',
        503: 'Service Temporarily Unavailable',
        403: 'Access Forbidden',
    };

    const descriptionMap: Record<number, string> = {
        404: "Oops! The page you're searching for doesn't exist, has been moved, or is temporarily out of order.",
        500: 'Something went wrong on our server while processing your request. Please try again shortly.',
        503: 'We are performing routine kitchen maintenance. Please check back in a few minutes.',
        403: 'You do not have administrative permission to view this restricted page.',
    };

    const errorTitle = titleMap[status] || 'Unexpected Error';
    const errorDescription = message || descriptionMap[status] || 'An unexpected system event has occurred.';

    return (
        <>
            <Head title={`${status} - ${errorTitle}`} />

            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4 text-slate-900 transition-colors md:p-8 dark:bg-slate-950 dark:text-slate-100">
                {/* Background Ambient Glows */}
                <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/15" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/15" />

                <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-xl transition-all sm:p-12 dark:border-slate-800 dark:bg-slate-900/90">
                    {/* Header Graphic Badge */}
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 shadow-inner dark:bg-amber-500/20">
                        <div className="relative flex items-center justify-center">
                            <UtensilsCrossed className="h-12 w-12 text-amber-500 dark:text-amber-400" />
                            <Search className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-2 border-white bg-slate-900 p-0.5 text-amber-400 dark:border-slate-900" />
                        </div>
                    </div>

                    {/* Status Code Hero */}
                    <div className="mt-6 text-center">
                        <span className="inline-block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
                            {status}
                        </span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                            {errorTitle}
                        </h1>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {errorDescription}
                        </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/admin/dashboard"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95 sm:w-auto"
                        >
                            <LayoutDashboard className="h-4 w-4" /> Back to Dashboard
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-200 active:scale-95 sm:w-auto dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" /> Go Back
                        </button>

                        <Link
                            href="/"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Home className="h-4 w-4" /> Public Menu Page
                        </Link>
                    </div>

                    {/* Quick Navigation Links */}
                    <div className="mt-10 border-t border-slate-200/80 pt-6 dark:border-slate-800/80">
                        <p className="text-center text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Quick Navigation Shortcuts
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                            <Link
                                href="/admin/sales"
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 transition-all hover:border-amber-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <ShoppingCart className="h-4 w-4 text-amber-500" /> POS Billing
                            </Link>

                            <Link
                                href="/admin/inventory"
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 transition-all hover:border-amber-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Boxes className="h-4 w-4 text-blue-500" /> Inventory
                            </Link>

                            <Link
                                href="/admin/menu"
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 transition-all hover:border-amber-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <UtensilsCrossed className="h-4 w-4 text-emerald-500" /> Menu Items
                            </Link>

                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-700 transition-all hover:border-amber-500/50 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Settings className="h-4 w-4 text-purple-500" /> App Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
