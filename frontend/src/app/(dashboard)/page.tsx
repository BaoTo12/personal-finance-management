"use client";

import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Send,
    CreditCard,
} from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { DonutChartComponent } from "@/components/charts/donut-chart";

// Mock data
const stats = {
    totalBalance: 48574.21,
    totalIncome: 12450.0,
    totalExpenses: 8320.5,
    savingsRate: 33.2,
};

const recentTransactions = [
    {
        id: "1",
        payee: "Apple Store",
        category: "Shopping",
        amount: -999.0,
        date: "2024-12-10",
        type: "debit" as const,
    },
    {
        id: "2",
        payee: "Salary Deposit",
        category: "Income",
        amount: 5200.0,
        date: "2024-12-09",
        type: "credit" as const,
    },
    {
        id: "3",
        payee: "Netflix",
        category: "Entertainment",
        amount: -15.99,
        date: "2024-12-08",
        type: "debit" as const,
    },
    {
        id: "4",
        payee: "Uber",
        category: "Transportation",
        amount: -24.5,
        date: "2024-12-08",
        type: "debit" as const,
    },
    {
        id: "5",
        payee: "Freelance Payment",
        category: "Income",
        amount: 1500.0,
        date: "2024-12-07",
        type: "credit" as const,
    },
];

const spendingByCategory = [
    { name: "Shopping", value: 2450, color: "#7C3AED" },
    { name: "Food & Dining", value: 1890, color: "#10B981" },
    { name: "Transportation", value: 980, color: "#F59E0B" },
    { name: "Entertainment", value: 650, color: "#3B82F6" },
    { name: "Bills & Utilities", value: 1200, color: "#EF4444" },
];

const monthlyData = [
    { month: "Jul", income: 8500, expenses: 6200 },
    { month: "Aug", income: 9200, expenses: 7100 },
    { month: "Sep", income: 8800, expenses: 6800 },
    { month: "Oct", income: 10500, expenses: 7500 },
    { month: "Nov", income: 11200, expenses: 8200 },
    { month: "Dec", income: 12450, expenses: 8320 },
];

export default function DashboardPage() {
    return (
        <>
            <Header title="Dashboard" subtitle="Welcome back, John!" />
            <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="animate-fade-in" style={{ animationDelay: "0ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Total Balance
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                        {formatCurrency(stats.totalBalance)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-[var(--primary)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3 text-sm">
                                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                                <span className="text-[var(--success)]">+12.5%</span>
                                <span className="text-[var(--text-muted)]">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="animate-fade-in" style={{ animationDelay: "50ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Total Income
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                        {formatCurrency(stats.totalIncome)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-[var(--success)]/20 flex items-center justify-center">
                                    <ArrowUpRight className="w-6 h-6 text-[var(--success)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3 text-sm">
                                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                                <span className="text-[var(--success)]">+8.2%</span>
                                <span className="text-[var(--text-muted)]">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Total Expenses
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                        {formatCurrency(stats.totalExpenses)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-[var(--error)]/20 flex items-center justify-center">
                                    <ArrowDownRight className="w-6 h-6 text-[var(--error)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3 text-sm">
                                <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                                <span className="text-[var(--error)]">+5.1%</span>
                                <span className="text-[var(--text-muted)]">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="animate-fade-in" style={{ animationDelay: "150ms" }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Savings Rate
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                        {stats.savingsRate}%
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-[var(--info)]/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-[var(--info)]" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3 text-sm">
                                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                                <span className="text-[var(--success)]">+2.3%</span>
                                <span className="text-[var(--text-muted)]">vs last month</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>Add Transaction</Button>
                    <Button variant="secondary" leftIcon={<Send className="w-4 h-4" />}>
                        Send Money
                    </Button>
                    <Button variant="secondary" leftIcon={<CreditCard className="w-4 h-4" />}>
                        Add Card
                    </Button>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Income vs Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AreaChartComponent data={monthlyData} />
                        </CardContent>
                    </Card>

                    {/* Donut Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending by Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChartComponent data={spendingByCategory} />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm">
                            View All
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "credit"
                                                    ? "bg-[var(--success)]/20"
                                                    : "bg-[var(--error)]/20"
                                                }`}
                                        >
                                            {transaction.type === "credit" ? (
                                                <ArrowUpRight className="w-5 h-5 text-[var(--success)]" />
                                            ) : (
                                                <ArrowDownRight className="w-5 h-5 text-[var(--error)]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                {transaction.payee}
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {transaction.category} • {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`font-semibold ${transaction.type === "credit"
                                                ? "text-[var(--success)]"
                                                : "text-[var(--text-primary)]"
                                            }`}
                                    >
                                        {transaction.type === "credit" ? "+" : ""}
                                        {formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
