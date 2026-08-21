import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-400">
                Platform
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = item.url === currentPath;
                    return (
                        <React.Fragment key={item.title}>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className={
                                        isActive
                                            ? 'bg-amber-500/10 font-bold text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25 dark:hover:bg-amber-500/25 dark:hover:text-amber-300'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white'
                                    }
                                >
                                    <Link href={item.url} prefetch>
                                        {item.icon && <item.icon className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'} />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {item.hasDash && (
                                <SidebarSeparator className="my-2 bg-slate-200/80 dark:bg-slate-800" />
                            )}
                        </React.Fragment>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
