import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut, User as UserIcon } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800"
                        href={route('profile.edit')}
                        prefetch
                        onClick={cleanup}
                    >
                        <UserIcon className="h-4 w-4 text-amber-500" />
                        Admin Profile & Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem asChild>
                <Link
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={cleanup}
                >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Sign Out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
