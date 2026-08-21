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
        404: "Oops! The recipe or page you're searching for doesn't exist, has been moved, or is temporarily out of order.",
        500: 'Something went wrong in our server kitchen while preparing your request. Please try again shortly.',
        503: 'We are performing routine kitchen maintenance. Please check back in a few minutes.',
        403: 'You do not have administrative permission to view this restricted page.',
    };

    const wordmarkMap: Record<number, string> = {
        404: 'NOT FOUND',
        500: 'SERVER ERROR',
        503: 'UNAVAILABLE',
        403: 'FORBIDDEN',
    };

    const errorTitle = titleMap[status] || 'Unexpected Error';
    const errorDescription = message || descriptionMap[status] || 'An unexpected system event has occurred.';
    const wordmark = wordmarkMap[status] || 'ERROR';

    const statusStr = String(status);
    const edgeLeft = statusStr.charAt(0);
    const edgeRight = statusStr.slice(1);

    return (
        <>
            <Head title={`${status} - ${errorTitle}`} />

            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0906] p-4 text-slate-100 transition-colors md:p-8">
                {/* Dark Wood Plank Background Texture Overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
                    style={{ backgroundImage: `url('/images/404-food-wood.jpg')` }}
                />

                {/* Ambient Warm Lighting Glows */}
                <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-700/15 blur-3xl" />

                {/* Giant edge-bleeding status digits */}
                <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-between overflow-hidden opacity-30">
                    <span className="-translate-x-8 text-[8rem] font-black text-amber-950/40 leading-none md:text-[16rem]">
                        {edgeLeft}
                    </span>
                    <span className="translate-x-8 text-[8rem] font-black text-amber-950/40 leading-none md:text-[16rem]">
                        {edgeRight}
                    </span>
                </div>

                {/* Giant faded wordmark */}
                <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-25">
                    <h1 className="whitespace-nowrap text-center text-[2.25rem] font-black tracking-widest text-amber-900/40 uppercase md:text-[6rem]">
                        {wordmark}
                    </h1>
                </div>

                <div className="relative z-10 my-auto flex w-full max-w-3xl flex-col items-center">
                    {/* Restaurant Food & Wood Visual Container (Matching the design) */}
                    <div className="relative w-full overflow-hidden rounded-3xl border border-amber-900/40 bg-stone-900/90 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all">
                        {/* Image Showcase Header */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60 sm:aspect-[21/9]">
                            <img
                                src="/images/404-food-wood.jpg"
                                alt="404 Restaurant Food & Wooden Planks Visual"
                                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                            {/* Overlay Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/70 px-3.5 py-1.5 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                </span>
                                <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                                    {status} Culinary Out of Stock
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 text-center sm:p-10">
                            {/* Title & Description */}
                            <div className="mx-auto max-w-xl">
                                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-3">
                                    <UtensilsCrossed className="h-4 w-4" /> {errorTitle}
                                </div>
                                <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                                    Plate Broken, Page Missing
                                </h1>
                                <p className="mt-3 text-xs leading-relaxed text-amber-200/70 sm:text-sm">
                                    {errorDescription}
                                </p>
                            </div>

                            {/* Primary Action Buttons */}
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800/80 px-5 py-3 text-xs font-bold text-stone-200 transition-all hover:bg-stone-700 active:scale-95 sm:w-auto"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Go Back
                                </button>

                                <Link
                                    href="/"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-900/50 bg-stone-900 px-5 py-3 text-xs font-bold text-amber-300 transition-all hover:bg-stone-800 active:scale-95 sm:w-auto"
                                >
                                    <Home className="h-4 w-4" /> Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}