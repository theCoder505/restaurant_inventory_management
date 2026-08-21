import { LoaderCircle, Mail, RefreshCw, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (otp: string) => void;
    targetEmail: string;
    actionTitle: string;
    actionDescription?: string;
    isSubmitting: boolean;
    serverError?: string;
    onResend: () => Promise<boolean | void>;
    initialCooldown?: number;
}

export default function OtpModal({
    isOpen,
    onClose,
    onConfirm,
    targetEmail,
    actionTitle,
    actionDescription,
    isSubmitting,
    serverError,
    onResend,
    initialCooldown = 60,
}: OtpModalProps) {
    const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [cooldown, setCooldown] = useState<number>(initialCooldown);
    const [isResending, setIsResending] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset digits when modal opens
    useEffect(() => {
        if (isOpen) {
            setDigits(['', '', '', '', '', '']);
            setLocalError(null);
            setCooldown(initialCooldown > 0 ? initialCooldown : 60);
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen, initialCooldown]);

    // Timer countdown
    useEffect(() => {
        if (!isOpen || cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, cooldown]);

    if (!isOpen) return null;

    const handleDigitChange = (index: number, value: string) => {
        setLocalError(null);

        // Allow only numbers
        const cleanVal = value.replace(/\D/g, '');

        if (!cleanVal) {
            const newDigits = [...digits];
            newDigits[index] = '';
            setDigits(newDigits);
            return;
        }

        // If user typed a single char
        const char = cleanVal.slice(-1);
        const newDigits = [...digits];
        newDigits[index] = char;
        setDigits(newDigits);

        // Auto advance to next input
        if (index < 5 && char) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        setLocalError(null);
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasteData) return;

        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasteData[i] || '';
        }
        setDigits(newDigits);

        const focusIndex = Math.min(pasteData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const otp = digits.join('');
        if (otp.length < 6) {
            setLocalError('Please enter the full 6-digit verification code.');
            const firstEmpty = digits.findIndex((d) => !d);
            if (firstEmpty !== -1) {
                inputRefs.current[firstEmpty]?.focus();
            }
            return;
        }

        onConfirm(otp);
    };

    const handleResendClick = async () => {
        if (cooldown > 0 || isResending) return;
        setIsResending(true);
        setLocalError(null);
        try {
            await onResend();
            setCooldown(60);
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch {
            setLocalError('Could not resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const activeError = localError || serverError;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={!isSubmitting ? onClose : undefined}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header Badge & Title */}
                <div className="text-center">
                    <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                        <ShieldCheck className="h-7 w-7" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {actionTitle} Verification
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {actionDescription || 'For your security, please verify this action using the code sent to your current email address.'}
                    </p>

                    {/* Target Email Box */}
                    <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{targetEmail}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {/* Segmented 6-digit input */}
                    <div>
                        <label className="block text-center text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">
                            Enter 6-Digit Verification Code
                        </label>
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {digits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => {
                                        inputRefs.current[idx] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={handlePaste}
                                    disabled={isSubmitting}
                                    autoComplete="one-time-code"
                                    className={`h-12 w-11 sm:w-12 rounded-xl border text-center text-xl font-black transition outline-none ${
                                        activeError
                                            ? 'border-rose-500 bg-rose-50/40 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                                            : digit
                                              ? 'border-amber-500 bg-amber-50/40 text-slate-900 shadow-xs ring-2 ring-amber-500/20 dark:bg-amber-950/20 dark:text-white'
                                              : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Error Message */}
                        {activeError && (
                            <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-rose-500 animate-in fade-in">
                                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                                <span>{activeError}</span>
                            </div>
                        )}
                    </div>

                    {/* Resend Action */}
                    <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                        {cooldown > 0 ? (
                            <span>
                                Resend available in <strong className="text-amber-500 font-bold">{cooldown}s</strong>
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResendClick}
                                disabled={isResending || isSubmitting}
                                className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                                {isResending ? 'Sending Code...' : 'Resend Verification Code'}
                            </button>
                        )}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || digits.join('').length < 6}
                            className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Verify & Save</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
