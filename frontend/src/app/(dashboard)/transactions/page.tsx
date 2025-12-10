"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Download,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, Button, Input, Badge, Modal } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTransactionStore } from "@/stores";

// Mock data
const transactions = [
    { id: "1", payee: "Apple Store", category: "Shopping", categoryColor: "#7C3AED", amount: -999.0, date: "2024-12-10", type: "debit" as const, account: "Chase Checking" },
    { id: "2", payee: "Salary Deposit", category: "Income", categoryColor: "#10B981", amount: 5200.0, date: "2024-12-09", type: "credit" as const, account: "Chase Checking" },
    { id: "3", payee: "Netflix", category: "Entertainment", categoryColor: "#3B82F6", amount: -15.99, date: "2024-12-08", type: "debit" as const, account: "Visa Card" },
    { id: "4", payee: "Uber", category: "Transportation", categoryColor: "#F59E0B", amount: -24.5, date: "2024-12-08", type: "debit" as const, account: "Visa Card" },
    { id: "5", payee: "Freelance Payment", category: "Income", categoryColor: "#10B981", amount: 1500.0, date: "2024-12-07", type: "credit" as const, account: "PayPal" },
    { id: "6", payee: "Grocery Store", category: "Food & Dining", categoryColor: "#EF4444", amount: -156.32, date: "2024-12-06", type: "debit" as const, account: "Chase Checking" },
    { id: "7", payee: "Electric Bill", category: "Bills & Utilities", categoryColor: "#6B7280", amount: -89.0, date: "2024-12-05", type: "debit" as const, account: "Chase Checking" },
    { id: "8", payee: "Amazon", category: "Shopping", categoryColor: "#7C3AED", amount: -234.99, date: "2024-12-04", type: "debit" as const, account: "Visa Card" },
];

export default function TransactionsPage() {
    const { isAddModalOpen, openAddModal, closeAddModal } = useTransactionStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<"all" | "debit" | "credit">("all");

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = t.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "all" || t.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <>
            <Header title="Transactions" subtitle="Manage your transactions" />
            <div className="p-6 space-y-6">
                {/* Filters */}
                <Card padding="md">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search transactions..."
                                leftIcon={<Search className="w-4 h-4" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedType === "all" ? "primary" : "secondary"}
                                onClick={() => setSelectedType("all")}
                            >
                                All
                            </Button>
                            <Button
                                variant={selectedType === "credit" ? "primary" : "secondary"}
                                onClick={() => setSelectedType("credit")}
                            >
                                Income
                            </Button>
                            <Button
                                variant={selectedType === "debit" ? "primary" : "secondary"}
                                onClick={() => setSelectedType("debit")}
                            >
                                Expenses
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                                Filters
                            </Button>
                            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                                Export
                            </Button>
                            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
                                Add
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card padding="none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border-color)]">
                                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] p-4">
                                        Transaction
                                    </th>
                                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] p-4">
                                        Category
                                    </th>
                                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] p-4">
                                        Account
                                    </th>
                                    <th className="text-left text-sm font-medium text-[var(--text-secondary)] p-4">
                                        Date
                                    </th>
                                    <th className="text-right text-sm font-medium text-[var(--text-secondary)] p-4">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="border-b border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
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
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    {transaction.payee}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                style={{ backgroundColor: `${transaction.categoryColor}20`, color: transaction.categoryColor }}
                                            >
                                                {transaction.category}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-[var(--text-secondary)]">
                                            {transaction.account}
                                        </td>
                                        <td className="p-4 text-[var(--text-secondary)]">
                                            {formatDate(transaction.date)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span
                                                className={`font-semibold ${transaction.type === "credit"
                                                        ? "text-[var(--success)]"
                                                        : "text-[var(--text-primary)]"
                                                    }`}
                                            >
                                                {transaction.type === "credit" ? "+" : ""}
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-[var(--border-color)]">
                        <p className="text-sm text-[var(--text-muted)]">
                            Showing 1-{filteredTransactions.length} of {filteredTransactions.length} transactions
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Add Transaction Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={closeAddModal}
                    title="Add Transaction"
                    description="Create a new transaction entry"
                >
                    <form className="space-y-4">
                        <Input label="Payee / Description" placeholder="Enter payee name" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Amount" placeholder="0.00" type="number" />
                            <Input label="Date" type="date" />
                        </div>
                        <Input label="Category" placeholder="Select category" />
                        <Input label="Account" placeholder="Select account" />
                        <Input label="Notes" placeholder="Optional notes..." />
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={closeAddModal} type="button">
                                Cancel
                            </Button>
                            <Button type="submit">Add Transaction</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
