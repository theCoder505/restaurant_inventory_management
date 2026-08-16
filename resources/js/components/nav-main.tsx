import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Platform
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = item.url === page.url;
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={
                                    isActive
                                        ? 'bg-amber-500/10 font-bold text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25 dark:hover:text-amber-300'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100'
                                }
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
