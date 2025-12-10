"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, ChevronRight, Mail, Smartphone, CreditCard } from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const settingsNav = [
    { label: "Profile", href: "/settings", icon: User },
    { label: "Security", href: "/settings/security", icon: Shield },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
];

interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative w-12 h-6 rounded-full transition-colors",
                enabled ? "bg-[var(--primary)]" : "bg-[var(--bg-input)]"
            )}
        >
            <span
                className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    enabled ? "translate-x-7" : "translate-x-1"
                )}
            />
        </button>
    );
}

export default function NotificationSettingsPage() {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState({
        emailTransactions: true,
        emailBudgetAlerts: true,
        emailWeeklyReport: false,
        emailNewsletter: false,
        pushTransactions: true,
        pushBudgetAlerts: true,
        pushReminders: false,
        smsAlerts: false,
    });

    const updateNotification = (key: keyof typeof notifications, value: boolean) => {
        setNotifications({ ...notifications, [key]: value });
    };

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

                    {/* Notification Settings */}
                    <div className="flex-1 space-y-6">
                        {/* Email Notifications */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                            Email Notifications
                                        </h2>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Manage email notification preferences
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Transaction Alerts
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Get notified for every transaction
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.emailTransactions}
                                            onChange={(v) => updateNotification("emailTransactions", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-[var(--border-color)]">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Budget Alerts
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Alerts when approaching budget limits
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.emailBudgetAlerts}
                                            onChange={(v) => updateNotification("emailBudgetAlerts", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-[var(--border-color)]">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Weekly Report
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Receive weekly spending summary
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.emailWeeklyReport}
                                            onChange={(v) => updateNotification("emailWeeklyReport", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-[var(--border-color)]">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Newsletter
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Tips and product updates
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.emailNewsletter}
                                            onChange={(v) => updateNotification("emailNewsletter", v)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Push Notifications */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                                        <Smartphone className="w-5 h-5 text-[var(--success)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                            Push Notifications
                                        </h2>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Manage push notification preferences
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Transaction Alerts
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Instant push for transactions
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.pushTransactions}
                                            onChange={(v) => updateNotification("pushTransactions", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-[var(--border-color)]">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Budget Alerts
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Push when nearing budget limits
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.pushBudgetAlerts}
                                            onChange={(v) => updateNotification("pushBudgetAlerts", v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-t border-[var(--border-color)]">
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Bill Reminders
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                Reminders for upcoming bills
                                            </p>
                                        </div>
                                        <Toggle
                                            enabled={notifications.pushReminders}
                                            onChange={(v) => updateNotification("pushReminders", v)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button>Save Preferences</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
