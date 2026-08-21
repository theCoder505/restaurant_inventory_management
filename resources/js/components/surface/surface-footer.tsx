import { Link } from '@inertiajs/react';
import { ArrowUp, ChevronUp, Facebook, Instagram, Twitter, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SurfaceSettings } from './surface-header';

interface SurfaceFooterProps {
    settings: SurfaceSettings;
}

export default function SurfaceFooter({ settings }: SurfaceFooterProps) {
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showFloatingActions, setShowFloatingActions] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowFloatingActions(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const targetPhone = settings.whatsapp_number || settings.phone || '+8801700000000';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${settings.brand_name}, I am contacting you from your website for inquiries & orders.`,
    )}`;

    const brandLogoImage = settings.brand_logo || settings.logo_url;

    return (
        <>
            {/* Main Surface Footer */}
            <footer className="border-t border-slate-200/90 bg-white py-14 text-xs text-slate-700 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-[#e5e2e1]/70 transition-colors relative">
                <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
                    {/* Left: Brand Logo & Tagline */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        {brandLogoImage ? (
                            <img
                                src={brandLogoImage}
                                alt={settings.brand_name}
                                className="h-8 sm:h-9 w-auto object-contain max-w-[150px]"
                            />
                        ) : (
                            <span className="font-montserrat text-lg font-extrabold text-slate-900 dark:text-[#ffb59e]">
                                {settings.brand_name}
                            </span>
                        )}
                        <p className="text-center md:text-left text-slate-600 dark:text-[#e5e2e1]/60">
                            {settings.footer_text || `© ${new Date().getFullYear()} ${settings.brand_name}. All Rights Reserved.`}
                        </p>
                    </div>

                    {/* Center: Footer Nav & Policy Triggers */}
                    <div className="flex flex-wrap items-center justify-center gap-6 font-montserrat text-xs font-bold text-slate-800 dark:text-slate-200">
                        <Link href="/#lineup" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-wider">
                            Full Menu
                        </Link>
                        <Link href="/#locations" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-wider">
                            Location & Hours
                        </Link>
                        <button
                            onClick={() => setShowTermsModal(true)}
                            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-wider"
                        >
                            Terms & Policies
                        </button>
                        <button
                            onClick={() => setShowPrivacyModal(true)}
                            className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-wider"
                        >
                            Privacy Notice
                        </button>

                        {/* Social Links */}
                        <div className="flex items-center gap-3.5 pl-2 border-l border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300">
                            {settings.social_facebook && (
                                <a
                                    href={settings.social_facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_instagram && (
                                <a
                                    href={settings.social_instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_twitter && (
                                <a
                                    href={settings.social_twitter}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right: Scroll to Top Button in Footer */}
                    <div>
                        <button
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 font-montserrat text-xs font-bold uppercase tracking-wider text-slate-800 transition-all active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 shadow-sm"
                            title="Scroll smoothly to top"
                        >
                            <span>Back To Top</span>
                            <ArrowUp className="h-3.5 w-3.5 text-orange-500 animate-bounce" />
                        </button>
                    </div>
                </div>
            </footer>

            {/* Floating Actions Stack at Bottom-Right (Only Appears After Scroll) */}
            {showFloatingActions && (
                <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200">
                    {/* 1. Scroll to Top Floating Button */}
                    <button
                        onClick={scrollToTop}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-white/20 transition-all hover:bg-slate-800 hover:scale-110 active:scale-95 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                        title="Scroll to top"
                        aria-label="Scroll to top"
                    >
                        <ChevronUp className="h-5 w-5" />
                    </button>
                    {/* 2. Floating Circular WhatsApp Logo Button (Only if enabled) */}
                    {settings.enable_whatsapp !== false && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-emerald-500/40 transition-all hover:scale-110 active:scale-95 group border border-white/30"
                            title={`Chat with ${settings.brand_name} on WhatsApp`}
                            aria-label="Chat on WhatsApp"
                        >
                            {/* Official WhatsApp Vector Logo */}
                            <svg
                                className="h-6 w-6 fill-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.678-1.634-.929-2.239-.244-.589-.493-.509-.678-.519l-.578-.01c-.2 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511s1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.722.23 1.378.198 1.897.12.578-.088 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351z" />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.912-1.353A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.165 8.165 0 01-4.298-1.214l-.308-.188-2.916.804.81-2.842-.206-.328A8.163 8.163 0 013.8 12c0-4.529 3.671-8.2 8.2-8.2 4.529 0 8.2 3.671 8.2 8.2 0 4.529-3.671 8.2-8.2 8.2z"
                                />
                            </svg>

                            {/* Live Pulsing Online Indicator */}
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
                            </span>
                        </a>
                    )}
                </div>
            )}

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1c1b1b]">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                            <h3 className="font-montserrat text-lg font-bold text-slate-900 dark:text-slate-100">Terms & Policies</h3>
                            <button onClick={() => setShowTermsModal(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto font-inter text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {settings.terms_conditions || 'Standard restaurant terms and operational policies apply to all orders.'}
                        </div>
                        <div className="pt-2 text-right">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 font-montserrat text-xs font-bold text-white shadow"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1c1b1b]">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                            <h3 className="font-montserrat text-lg font-bold text-slate-900 dark:text-slate-100">Privacy Notice</h3>
                            <button onClick={() => setShowPrivacyModal(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto font-inter text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {settings.privacy_policy || 'We respect customer privacy and protect all order, phone, and delivery information.'}
                        </div>
                        <div className="pt-2 text-right">
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 font-montserrat text-xs font-bold text-white shadow"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
