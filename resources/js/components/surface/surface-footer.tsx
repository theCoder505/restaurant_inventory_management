import { Link } from '@inertiajs/react';
import { ArrowUp, Facebook, Instagram, Twitter, X } from 'lucide-react';
import { useState } from 'react';
import { SurfaceSettings } from './surface-header';

interface SurfaceFooterProps {
    settings: SurfaceSettings;
}

export default function SurfaceFooter({ settings }: SurfaceFooterProps) {
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

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
                                loading="lazy"
                                decoding="async"
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
