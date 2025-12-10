"use client";

import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";
import { Avatar, Button, Input } from "@/components/ui";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const { sidebarCollapsed, toggleMobileSidebar } = useUIStore();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header
            className={cn(
                "fixed top-0 right-0 h-16 bg-[var(--bg-dark)]/80 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 z-30 transition-all duration-300",
                sidebarCollapsed ? "left-20" : "left-64"
            )}
        >
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Page title */}
                <div>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:block w-64">
                    <Input
                        placeholder="Search..."
                        leftIcon={<Search className="w-4 h-4" />}
                        className="h-9"
                    />
                </div>

                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden animate-slide-up">
                            <div className="p-4 border-b border-[var(--border-color)]">
                                <h3 className="font-medium text-[var(--text-primary)]">
                                    Notifications
                                </h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                <div className="p-4 text-center text-[var(--text-muted)]">
                                    No new notifications
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User */}
                <Avatar name="John Doe" size="sm" />
            </div>
        </header>
    );
}
