import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import {
    DollarSign,
    FolderTree,
    Globe,
    History,
    LayoutDashboard,
    Quote,
    Receipt,
    Settings,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/administration-control/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Categories',
        url: '/administration-control/categories',
        icon: FolderTree,
        hasDash: true,
    },
    {
        title: 'Suppliers / Vendors',
        url: '/administration-control/suppliers',
        icon: Truck,
    },
    {
        title: 'Purchases & POs',
        url: '/administration-control/purchases',
        icon: ShoppingBag,
    },
    {
        title: 'HR & Salaries',
        url: '/administration-control/employees',
        icon: Users,
    },
    {
        title: 'Bills & Expenses',
        url: '/administration-control/expenses',
        icon: DollarSign,
        hasDash: true,
    },
    {
        title: 'Menu & Recipes',
        url: '/administration-control/menu',
        icon: UtensilsCrossed,
    },
    {
        title: 'POS Billing',
        url: '/administration-control/sales',
        icon: ShoppingCart,
    },
    {
        title: 'Sales Log',
        url: '/administration-control/sales/log',
        icon: Receipt,
        hasDash: true,
    },
    {
        title: 'P&L Reports',
        url: '/administration-control/reports',
        icon: TrendingUp,
    },
    {
        title: 'Audit Logs',
        url: '/administration-control/audit-logs',
        icon: History,
        hasDash: true,
    },
    {
        title: 'Customer Reviews',
        url: '/administration-control/reviews',
        icon: Quote,
    },
    {
        title: 'App Settings',
        url: '/administration-control/settings',
        icon: Settings,
    },
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'Live Surface Website',
        url: '/',
        icon: Globe,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <SidebarHeader className="border-b border-slate-200/80 p-4 dark:border-slate-800/80 dark:bg-slate-900">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800/80">
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4 dark:bg-slate-900">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/80 p-2 dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex flex-col gap-2">
                    <NavMain items={secondaryNavItems} />
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
