import { ChevronUp, MessageCircle, Send, Sparkles, Utensils, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { SurfaceSettings } from './surface-header';

interface SurfaceFloatingActionsProps {
    settings: SurfaceSettings;
}

const QUICK_PROMPTS = [
    { label: '🍔 Order Food', text: 'Hello, I would like to place an order for delivery/pickup.' },
    { label: '🍽️ Book a Table', text: 'Hello, I would like to inquire about table reservations & VIP lounge.' },
    { label: '🔥 Chef Specials', text: 'Hello, what are today’s chef specials and signature recommendations?' },
    { label: '💬 General Inquiry', text: 'Hello, I have a general question regarding your restaurant and menu.' },
];

export default function SurfaceFloatingActions({ settings }: SurfaceFloatingActionsProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const popupRef = useRef<HTMLDivElement | null>(null);

    // Scroll listener that checks for #hero-section
    useEffect(() => {
        const checkScroll = () => {
            const heroSection = document.getElementById('hero-section');
            if (heroSection) {
                // On landing page with pinned multi-screen hero section:
                // Only show after the hero section has been properly scrolled through
                const heroTop = heroSection.offsetTop;
                const heroHeight = heroSection.offsetHeight;
                const threshold = heroTop + heroHeight - window.innerHeight * 0.9;
                setIsVisible(window.scrollY >= threshold);
            } else {
                // On subpages (recipes, recipe detail, etc.)
                setIsVisible(window.scrollY > 300);
            }
        };

        window.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll, { passive: true });
        checkScroll();

        return () => {
            window.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    // Close popup on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setIsPopupOpen(false);
            }
        };
        if (isPopupOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPopupOpen]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const targetPhone = settings.whatsapp_number || settings.phone || '+8801700000000';
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    const handleSendWhatsApp = (messageToSend?: string) => {
        const text = messageToSend || customMessage.trim() || `Hello ${settings.brand_name}, I am contacting you from your website.`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsPopupOpen(false);
        setCustomMessage('');
    };

    const isWhatsAppEnabled = settings.enable_whatsapp !== false;
    const brandLogoImage = settings.brand_logo || settings.logo_url;

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto animate-in fade-in zoom-in slide-in-from-bottom-5 duration-300">
            {/* WhatsApp Interactive Quick-Chat Popup Card */}
            {isWhatsAppEnabled && isPopupOpen && (
                <div
                    ref={popupRef}
                    className="w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/40 overflow-hidden mb-1 animate-in zoom-in-95 fade-in duration-200 flex flex-col"
                >
                    {/* Header with WhatsApp Emerald Branding & Restaurant Info */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {brandLogoImage ? (
                                    <img
                                        src={brandLogoImage}
                                        alt={settings.brand_name}
                                        className="h-10 w-10 rounded-full bg-white object-contain p-1 shadow-sm"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-montserrat font-bold text-sm shadow-sm">
                                        <Utensils className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-300 border-2 border-emerald-700 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-montserrat text-sm font-bold leading-tight">
                                    {settings.brand_name}
                                </h4>
                                <p className="text-[11px] text-emerald-100/90 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 inline-block" />
                                    <span>Kitchen Online • Fast Replies</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                            aria-label="Close WhatsApp chat popup"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] space-y-3">
                        {/* Greeting Bubble */}
                        <div className="p-3 rounded-xl bg-white dark:bg-[#252525] border border-slate-200 dark:border-white/5 shadow-sm text-xs font-inter text-slate-800 dark:text-slate-200 leading-relaxed">
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                👋 Welcome to {settings.brand_name}!
                            </p>
                            <p>
                                Hungry for midnight gourmet burgers, artisan recipes, or want to reserve a table? Choose an option below or send us a message!
                            </p>
                        </div>

                        {/* Preset Quick Actions */}
                        <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                                Quick Inquiries
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {QUICk_PROMPTS_LIST(QUICK_PROMPTS, handleSendWhatsApp)}
                            </div>
                        </div>

                        {/* Custom Message Input */}
                        <div className="pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendWhatsApp();
                                        }
                                    }}
                                    className="flex-1 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#202020] px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                                />
                                <button
                                    onClick={() => handleSendWhatsApp()}
                                    className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
                                    title="Send message on WhatsApp"
                                    aria-label="Send message on WhatsApp"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Buttons Stack (Scroll-To-Top + WhatsApp Toggle) */}
            <div className="flex flex-col items-center gap-2.5">
                {/* 1. Scroll To Top Button */}
                <button
                    onClick={scrollToTop}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-white/20 transition-all hover:bg-slate-800 hover:scale-110 active:scale-95 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    title="Scroll smoothly to top"
                    aria-label="Scroll smoothly to top"
                >
                    <ChevronUp className="h-5 w-5" />
                </button>

                {/* 2. WhatsApp Floating Button */}
                {isWhatsAppEnabled && (
                    <button
                        onClick={() => setIsPopupOpen((prev) => !prev)}
                        className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-110 active:scale-95 group border border-white/30 ${
                            isPopupOpen
                                ? 'bg-slate-900 dark:bg-slate-800 shadow-slate-900/50'
                                : 'bg-[#25D366] hover:bg-[#20ba59] shadow-emerald-500/40'
                        }`}
                        title={isPopupOpen ? 'Close WhatsApp options' : `Chat with ${settings.brand_name} on WhatsApp`}
                        aria-label="Toggle WhatsApp chat popup"
                    >
                        {isPopupOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <>
                                {/* Official WhatsApp Vector Icon */}
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
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white" />
                                </span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function QUICk_PROMPTS_LIST(
    prompts: typeof QUICK_PROMPTS,
    onSelect: (text: string) => void,
) {
    return prompts.map((p, i) => (
        <button
            key={i}
            onClick={() => onSelect(p.text)}
            className="p-2 rounded-xl text-left bg-white dark:bg-[#202020] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-white/10 hover:border-emerald-400 text-[11px] font-montserrat font-semibold text-slate-800 dark:text-slate-200 transition-all truncate shadow-xs"
        >
            {p.label}
        </button>
    ));
}
