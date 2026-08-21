import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-4 w-4 text-amber-400" />;
            case 'light':
                return <Sun className="h-4 w-4 text-amber-500" />;
            default:
                return <Monitor className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl border border-slate-200/90 bg-white/70 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100 shadow-xs transition-colors cursor-pointer"
                        title="Switch theme (Light / Dark / System)"
                    >
                        {getCurrentIcon()}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                    <DropdownMenuItem
                        onClick={() => updateAppearance('light')}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="h-4 w-4 text-amber-500" />
                            Light
                        </span>
                        {appearance === 'light' && <Check className="h-3.5 w-3.5 text-amber-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('dark')}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="h-4 w-4 text-amber-400" />
                            Dark
                        </span>
                        {appearance === 'dark' && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('system')}
                        className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
                    >
                        <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-slate-400" />
                            System
                        </span>
                        {appearance === 'system' && <Check className="h-3.5 w-3.5 text-amber-500" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
