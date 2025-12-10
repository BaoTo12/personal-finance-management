"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Bell, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, Button, Input, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

const settingsNav = [
    { label: "Profile", href: "/settings", icon: User },
    { label: "Security", href: "/settings/security", icon: Shield },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
];

export default function SettingsProfilePage() {
    const pathname = usePathname();
    const [formData, setFormData] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 234 567 8900",
        currency: "USD",
        language: "English",
    });

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

                    {/* Profile Settings */}
                    <Card className="flex-1">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                                Profile Settings
                            </h2>

                            {/* Avatar Section */}
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--border-color)]">
                                <Avatar name="John Doe" size="xl" />
                                <div>
                                    <h3 className="font-medium text-[var(--text-primary)]">
                                        Profile Photo
                                    </h3>
                                    <p className="text-sm text-[var(--text-muted)] mb-2">
                                        JPG, PNG or GIF, max 2MB
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            Upload
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                    />
                                    <Input
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                    />
                                </div>

                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />

                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Currency"
                                        value={formData.currency}
                                        onChange={(e) =>
                                            setFormData({ ...formData, currency: e.target.value })
                                        }
                                    />
                                    <Input
                                        label="Language"
                                        value={formData.language}
                                        onChange={(e) =>
                                            setFormData({ ...formData, language: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="secondary" type="button">
                                        Cancel
                                    </Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
