"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, ChevronRight, Key, Smartphone, Monitor } from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const settingsNav = [
    { label: "Profile", href: "/settings", icon: User },
    { label: "Security", href: "/settings/security", icon: Shield },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
];

const sessions = [
    { device: "MacBook Pro", location: "San Francisco, CA", lastActive: "Now", current: true },
    { device: "iPhone 14 Pro", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
    { device: "Windows PC", location: "New York, NY", lastActive: "3 days ago", current: false },
];

export default function SecuritySettingsPage() {
    const pathname = usePathname();
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <>
            <Header title="Settings" subtitle="Manage your account settings" />
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Settings Navigation */}
                    <Card className="lg:w-64 h-fit">
                        <CardContent className="p-4">
                            <nav className="space-y-1">
                                {settingsNav.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-[var(--primary)] text-white"
                                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <div className="flex-1 space-y-6">
                        {/* Change Password */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                                        <Key className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                            Change Password
                                        </h2>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Update your password regularly to keep your account secure
                                        </p>
                                    </div>
                                </div>

                                <form className="space-y-4">
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="Enter current password"
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="Enter new password"
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="Confirm new password"
                                    />
                                    <div className="flex justify-end">
                                        <Button>Update Password</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Two-Factor Authentication */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                                            <Smartphone className="w-5 h-5 text-[var(--success)]" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                                Two-Factor Authentication
                                            </h2>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Add an extra layer of security to your account
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                        className={cn(
                                            "relative w-12 h-6 rounded-full transition-colors",
                                            twoFactorEnabled ? "bg-[var(--success)]" : "bg-[var(--bg-input)]"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                                twoFactorEnabled ? "translate-x-7" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Sessions */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--info)]/20 flex items-center justify-center">
                                        <Monitor className="w-5 h-5 text-[var(--info)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                            Active Sessions
                                        </h2>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Manage devices where you&apos;re currently logged in
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {sessions.map((session, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-[var(--text-primary)]">
                                                        {session.device}
                                                    </p>
                                                    {session.current && (
                                                        <span className="text-xs bg-[var(--success)]/20 text-[var(--success)] px-2 py-0.5 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    {session.location} • {session.lastActive}
                                                </p>
                                            </div>
                                            {!session.current && (
                                                <Button variant="ghost" size="sm" className="text-[var(--error)]">
                                                    Revoke
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                    <Button variant="outline" className="text-[var(--error)]">
                                        Sign out all devices
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
