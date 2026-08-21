import { ReactNode } from 'react';
import SurfaceFloatingActions from './surface-floating-actions';
import SurfaceFooter from './surface-footer';
import SurfaceHeader, { SurfaceSettings } from './surface-header';
import SurfacePreloader from './surface-preloader';

interface SurfaceLayoutProps {
    settings: SurfaceSettings;
    children: ReactNode;
    isSubpage?: boolean;
    backUrl?: string;
    backLabel?: string;
    customOrderText?: string;
}

export default function SurfaceLayout({
    settings,
    children,
    isSubpage = false,
    backUrl = '/#lineup',
    backLabel = 'Back To Menu',
    customOrderText,
}: SurfaceLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 font-inter text-slate-900 selection:bg-orange-500 selection:text-white transition-colors duration-300 dark:bg-[#0a0a0a] dark:text-[#e5e2e1] flex flex-col justify-between relative">
            {/* Restaurant Preloader for Surface Pages */}
            <SurfacePreloader settings={settings} />

            <SurfaceHeader
                settings={settings}
                isSubpage={isSubpage}
                backUrl={backUrl}
                backLabel={backLabel}
                customOrderText={customOrderText}
            />

            <div className="flex-1 w-full">{children}</div>

            <SurfaceFooter settings={settings} />

            {/* Smart Floating Actions (Scroll-to-top & WhatsApp interactive popup, visible after hero scroll on landing page) */}
            <SurfaceFloatingActions settings={settings} />
        </div>
    );
}

