import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { name, branding } = usePage<{ name?: string; branding?: { brand_name?: string; brand_logo?: string } }>().props;

    const brandName = branding?.brand_name || name || 'Restaurant';

    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="h-8 w-8 shrink-0" />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{brandName}</span>
                <span className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">Inventory & Management</span>
            </div>
        </div>
    );
}
