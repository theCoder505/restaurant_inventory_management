import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
    interface Window {
        __APP_BRAND_NAME?: string;
        Ziggy?: any;
    }
}

// Global active brand name fallback
window.__APP_BRAND_NAME = 'Restaurant';

// Listen to all Inertia page transitions and settings saves to update title instantly
router.on('navigate', (event) => {
    const pageProps = event.detail.page.props as any;
    const dynamicBrandName = pageProps?.name || pageProps?.branding?.brand_name;
    if (dynamicBrandName) {
        window.__APP_BRAND_NAME = dynamicBrandName;
    }
    if (pageProps?.ziggy) {
        window.Ziggy = pageProps.ziggy;
    }
});

createInertiaApp({
    title: (title) => {
        const brandName = window.__APP_BRAND_NAME || 'Restaurant';
        return title ? `${title} - ${brandName}` : brandName;
    },
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const initialProps = props.initialPage.props as any;
        const initialBrandName = initialProps?.name || initialProps?.branding?.brand_name;
        if (initialBrandName) {
            window.__APP_BRAND_NAME = initialBrandName;
        }
        if (initialProps?.ziggy) {
            window.Ziggy = initialProps.ziggy;
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Initialize light / dark mode on load...
initializeTheme();
