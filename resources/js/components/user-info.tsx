import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-amber-500/20 font-bold text-amber-700 dark:bg-amber-500/30 dark:text-amber-300">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
                {showEmail && <span className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>}
            </div>
        </>
    );
}
