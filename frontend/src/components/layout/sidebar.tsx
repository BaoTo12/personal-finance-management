"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ArrowLeftRight,
    FileText,
    Wallet,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { Avatar } from "@/components/ui";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "My Wallets", href: "/wallets", icon: Wallet },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar } = useUIStore();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 z-40",
                sidebarCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-color)]">
                {!sidebarCollapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-lg font-semibold text-[var(--text-primary)]">
                            Maglo
                        </span>
                    </Link>
                )}
                {sidebarCollapsed && (
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center mx-auto">
                        <span className="text-white font-bold">M</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-[var(--primary)] text-white"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                                sidebarCollapsed && "justify-center"
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 w-6 h-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
                {sidebarCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                ) : (
                    <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* User Profile */}
            <div className="p-4 border-t border-[var(--border-color)]">
                <div
                    className={cn(
                        "flex items-center gap-3",
                        sidebarCollapsed && "justify-center"
                    )}
                >
                    <Avatar name="John Doe" size="md" />
                    {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                John Doe
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                                john@example.com
                            </p>
                        </div>
                    )}
                    {!sidebarCollapsed && (
                        <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
