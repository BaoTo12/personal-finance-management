"use client";

import { type ReactNode } from "react";
import { Sidebar, Header } from "@/components/layout";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { sidebarCollapsed } = useUIStore();

    return (
        <div className="min-h-screen bg-[var(--bg-dark)]">
            <Sidebar />
            <main
                className={cn(
                    "min-h-screen transition-all duration-300 pt-16",
                    sidebarCollapsed ? "ml-20" : "ml-64"
                )}
            >
                {children}
            </main>
        </div>
    );
}
