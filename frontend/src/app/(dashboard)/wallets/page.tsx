"use client";

import { useState } from "react";
import { Plus, CreditCard, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Button, Modal, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

// Mock data
const wallets = [
    {
        id: "1",
        name: "Chase Sapphire",
        type: "visa",
        cardNumber: "4532",
        balance: 12450.0,
        gradientColors: ["#667eea", "#764ba2"],
        isDefault: true,
    },
    {
        id: "2",
        name: "Capital One",
        type: "mastercard",
        cardNumber: "5412",
        balance: 8320.5,
        gradientColors: ["#f093fb", "#f5576c"],
        isDefault: false,
    },
    {
        id: "3",
        name: "Amex Gold",
        type: "amex",
        cardNumber: "3782",
        balance: 24150.75,
        gradientColors: ["#4facfe", "#00f2fe"],
        isDefault: false,
    },
    {
        id: "4",
        name: "Discover It",
        type: "discover",
        cardNumber: "6011",
        balance: 3653.0,
        gradientColors: ["#43e97b", "#38f9d7"],
        isDefault: false,
    },
];

const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

export default function WalletsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showBalances, setShowBalances] = useState(true);

    return (
        <>
            <Header title="My Wallets" subtitle="Manage your cards and accounts" />
            <div className="p-6 space-y-6">
                {/* Total Balance */}
                <Card className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Total Balance</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {showBalances ? formatCurrency(totalBalance) : "••••••"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowBalances(!showBalances)}
                                    className="text-white hover:bg-white/20"
                                >
                                    {showBalances ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-white/80 text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+12.5% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wallets.map((wallet) => (
                        <div
                            key={wallet.id}
                            className="relative rounded-2xl p-6 text-white overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-transform"
                            style={{
                                background: `linear-gradient(135deg, ${wallet.gradientColors[0]} 0%, ${wallet.gradientColors[1]} 100%)`,
                            }}
                        >
                            {/* Card Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

                            {/* Card Content */}
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-8 h-8" />
                                        <span className="text-sm font-medium opacity-90">
                                            {wallet.type.toUpperCase()}
                                        </span>
                                    </div>
                                    {wallet.isDefault && (
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <p className="text-lg tracking-wider font-mono">
                                        •••• •••• •••• {wallet.cardNumber}
                                    </p>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs opacity-70">Card Name</p>
                                        <p className="font-medium">{wallet.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs opacity-70">Balance</p>
                                        <p className="font-semibold text-lg">
                                            {showBalances ? formatCurrency(wallet.balance) : "••••"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card */}
                    <div
                        onClick={() => setIsAddModalOpen(true)}
                        className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[var(--primary)] transition-colors min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
                            <Plus className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-secondary)]">Add New Card</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">Total Cards</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                {wallets.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">This Month&apos;s Spending</p>
                            <p className="text-2xl font-bold text-[var(--error)] mt-1">
                                -{formatCurrency(8320.50)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">This Month&apos;s Income</p>
                            <p className="text-2xl font-bold text-[var(--success)] mt-1">
                                +{formatCurrency(12450.00)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Card Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add New Card"
                    description="Link a new card or account"
                >
                    <form className="space-y-4">
                        <Input label="Card Name" placeholder="e.g., Chase Sapphire" />
                        <Input label="Card Number (Last 4)" placeholder="1234" maxLength={4} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Card Type" placeholder="Visa, Mastercard, etc." />
                            <Input label="Initial Balance" placeholder="0.00" type="number" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                                Cancel
                            </Button>
                            <Button type="submit">Add Card</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
