import { usePage } from '@inertiajs/react';
import { Utensils } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = 'w-6 h-6', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { branding } = usePage<{ branding?: { brand_icon?: string; brand_name?: string } }>().props;

    if (branding?.brand_icon) {
        return (
            <div className={`flex items-center justify-center overflow-hidden rounded-xl ${className}`} {...props}>
                <img src={branding.brand_icon} alt={branding.brand_name || 'Brand Icon'} className="h-full w-full object-contain" />
            </div>
        );
    }

    return (
        <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-md ${className}`}
            {...props}
        >
            <Utensils className="h-5 w-5" />
        </div>
    );
}
