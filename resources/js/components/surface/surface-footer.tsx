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

                    {/* 2. Floating Circular WhatsApp Logo Button */}
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
                        >
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.079-2.146-.532-1.724-.727-2.825-2.474-2.91-2.589-.086-.114-.693-.923-.693-1.761s.443-1.25.602-1.422c.16-.172.348-.215.464-.215.116 0 .232.002.333.007.107.005.25.04.39.377.144.348.492 1.203.535 1.29.043.086.072.187.014.302-.058.115-.087.187-.174.288-.087.101-.183.226-.261.304-.087.087-.178.182-.077.355.101.173.449.741.964 1.2 0.662.59 1.22.773 1.393.86.173.086.275.072.376-.044.101-.115.434-.504.55-.677.115-.173.231-.144.39-.086s1.013.477 1.187.564.29.13.333.203c.043.072.043.418-.101.823z" />
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.662 1.442 5.178L2 22l4.982-1.397A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 0 1-4.223-1.168l-.303-.18-3.088.866.883-2.997-.197-.315A8.17 8.17 0 1 1 12 20.2z" />
                        </svg>

                        {/* Pulsing 24/7 Online Indicator Dot */}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-85"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                        </span>
                    </a>
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
