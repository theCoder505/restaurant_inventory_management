import React, { useEffect, useState } from 'react';
import { SurfaceSettings } from './surface-header';

interface SurfacePreloaderProps {
    settings?: SurfaceSettings;
    minDisplayTimeMs?: number;
}

const CULINARY_MESSAGES = [
    'Stacking fresh ingredients...',
    'Squeezing something refreshing...',
    'Sliding a pizza in the oven...',
];

function BurgerIcon() {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 sm:w-14 sm:h-14"
        >
            {/* Top Bun */}
            <path
                d="M 22 46 C 22 28, 78 28, 78 46 Z"
                stroke="white"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {/* Sesame Seeds */}
            <ellipse cx="38" cy="36" rx="2.6" ry="1.6" fill="white" transform="rotate(-15 38 36)" />
            <ellipse cx="50" cy="33" rx="2.6" ry="1.6" fill="white" transform="rotate(5 50 33)" />
            <ellipse cx="62" cy="36" rx="2.6" ry="1.6" fill="white" transform="rotate(15 62 36)" />

            {/* Lettuce (wavy line) */}
            <path
                d="M 20 50 Q 26 46, 32 50 T 44 50 T 56 50 T 68 50 T 80 50"
                stroke="white"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Patty */}
            <path d="M 20 60 L 80 60" stroke="white" strokeWidth="4" strokeLinecap="round" />

            {/* Bottom Bun */}
            <path
                d="M 22 68 L 78 68 C 78 76, 22 76, 22 68 Z"
                stroke="white"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    );
}

function JuiceIcon() {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 sm:w-14 sm:h-14"
        >
            {/* Straw */}
            <path d="M 66 12 L 54 32" stroke="white" strokeWidth="3.4" strokeLinecap="round" />

            {/* Glass */}
            <path
                d="M 30 26 L 70 26 L 63 82 C 63 87, 37 87, 37 82 Z"
                stroke="white"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Liquid surface line */}
            <path
                d="M 34 40 Q 50 34, 66 40"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Ice cubes / bubbles */}
            <rect x="42" y="52" width="8" height="8" rx="1.5" stroke="white" strokeWidth="2.4" transform="rotate(8 46 56)" />
            <circle cx="58" cy="66" r="3.4" fill="white" />
        </svg>
    );
}

function PizzaIcon() {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 sm:w-14 sm:h-14"
        >
            {/* Slice outline */}
            <path
                d="M 50 18 L 80 78 Q 50 88, 20 78 Z"
                stroke="white"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Crust line */}
            <path
                d="M 27 66 Q 50 76, 73 66"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Pepperoni */}
            <circle cx="46" cy="42" r="4.4" fill="white" />
            <circle cx="60" cy="54" r="4.4" fill="white" />
            <circle cx="41" cy="58" r="4.4" fill="white" />
        </svg>
    );
}

const FOOD_ICONS = [BurgerIcon, JuiceIcon, PizzaIcon];

export default function SurfacePreloader({
    settings,
    minDisplayTimeMs = 800,
}: SurfacePreloaderProps) {
    const [progress, setProgress] = useState(15);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const messageTimer = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % CULINARY_MESSAGES.length);
        }, 800);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) {
                    clearInterval(progressInterval);
                    return 92;
                }
                const step = Math.floor(Math.random() * 16) + 8;
                return Math.min(92, prev + step);
            });
        }, 100);

        const completeTimer = setTimeout(() => {
            setProgress(100);
            const fadeTimer = setTimeout(() => {
                setIsFadingOut(true);
                const removeTimer = setTimeout(() => {
                    setIsRemoved(true);
                }, 650);
                return () => clearTimeout(removeTimer);
            }, 350);
            return () => clearTimeout(fadeTimer);
        }, minDisplayTimeMs);

        return () => {
            clearInterval(messageTimer);
            clearInterval(progressInterval);
            clearTimeout(completeTimer);
        };
    }, [minDisplayTimeMs]);

    if (isRemoved) return null;

    const ActiveIcon = FOOD_ICONS[messageIndex % FOOD_ICONS.length];

    return (
        <div
            id="surface-restaurant-preloader"
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b19] select-none transition-all duration-700 ease-out ${isFadingOut
                ? 'opacity-0 scale-105 pointer-events-none'
                : 'opacity-100 scale-100 pointer-events-auto'
                }`}
            aria-live="polite"
            aria-busy={!isFadingOut}
        >
            {/* Scoped keyframes for the two bouncing circles + icon swap */}
            <style>{`
                @keyframes burgerBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                @keyframes dotBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-22px) scale(0.9); }
                }
                @keyframes iconPop {
                    0% { opacity: 0; transform: scale(0.6) rotate(-8deg); }
                    60% { opacity: 1; transform: scale(1.08) rotate(2deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0deg); }
                }
            `}</style>

            {/* Ambient Warm Orange Glow in Backdrop */}
            <div className="absolute w-96 h-96 rounded-full bg-[#f5a623]/15 blur-3xl pointer-events-none animate-pulse" />

            <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
                {/* Bouncing Circle + Satellite Dot Scene, cycling through food icons */}
                <div className="relative w-48 h-40 sm:w-56 sm:h-44 flex items-center justify-center mb-6">
                    {/* Satellite Dot (bounces out of phase, top-right) */}
                    <div
                        className="absolute top-1 right-4 sm:right-6 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#f5a623] shadow-lg shadow-[#f5a623]/40"
                        style={{ animation: 'dotBounce 1.1s ease-in-out infinite 0.15s' }}
                    />

                    {/* Main Circle */}
                    <div
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#f5a623] shadow-xl shadow-[#f5a623]/40 flex items-center justify-center overflow-hidden"
                        style={{ animation: 'burgerBounce 1.1s ease-in-out infinite' }}
                    >
                        <div
                            key={messageIndex}
                            className="flex items-center justify-center"
                            style={{ animation: 'iconPop 0.4s ease-out' }}
                        >
                            <ActiveIcon />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}