"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Download,
    Send,
    Eye,
} from "lucide-react";
import { Header } from "@/components/layout";
import { Card, CardContent, Button, Input, Badge, Modal } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

// Mock data
const invoices = [
    { id: "INV-001", client: "Acme Corp", email: "billing@acme.com", amount: 2500.0, status: "paid" as const, dueDate: "2024-12-01", issueDate: "2024-11-15" },
    { id: "INV-002", client: "Tech Solutions", email: "finance@techsol.com", amount: 4200.0, status: "pending" as const, dueDate: "2024-12-15", issueDate: "2024-11-30" },
    { id: "INV-003", client: "Design Studio", email: "pay@design.co", amount: 1800.0, status: "overdue" as const, dueDate: "2024-11-28", issueDate: "2024-11-14" },
    { id: "INV-004", client: "Marketing Agency", email: "billing@market.io", amount: 3500.0, status: "pending" as const, dueDate: "2024-12-20", issueDate: "2024-12-05" },
    { id: "INV-005", client: "Startup Inc", email: "cfo@startup.io", amount: 950.0, status: "paid" as const, dueDate: "2024-11-30", issueDate: "2024-11-10" },
    { id: "INV-006", client: "Consulting Group", email: "ar@consult.com", amount: 6000.0, status: "draft" as const, dueDate: "2024-12-25", issueDate: "2024-12-10" },
];

const statusColors = {
    paid: "success",
    pending: "warning",
    overdue: "error",
    draft: "default",
    cancelled: "default",
} as const;

const statusLabels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    draft: "Draft",
    cancelled: "Cancelled",
};

export default function InvoicesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || inv.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = filteredInvoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = filteredInvoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <>
            <Header title="Invoices" subtitle="Manage and track your invoices" />
            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">Total Invoiced</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                {formatCurrency(totalAmount)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">Paid</p>
                            <p className="text-2xl font-bold text-[var(--success)] mt-1">
                                {formatCurrency(paidAmount)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-sm text-[var(--text-secondary)]">Pending</p>
                            <p className="text-2xl font-bold text-[var(--warning)] mt-1">
                                {formatCurrency(pendingAmount)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card padding="md">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search invoices..."
                                leftIcon={<Search className="w-4 h-4" />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {["all", "paid", "pending", "overdue", "draft"].map((status) => (
                                <Button
                                    key={status}
                                    variant={selectedStatus === status ? "primary" : "secondary"}
                                    size="sm"
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                            ))}
                        </div>
                        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
                            New Invoice
                        </Button>
                    </div>
                </Card>

                {/* Invoices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInvoices.map((invoice) => (
                        <Card key={invoice.id} className="hover:border-[var(--primary)] transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {invoice.id}
                                            </p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                {invoice.client}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={statusColors[invoice.status]}>
                                        {statusLabels[invoice.status]}
                                    </Badge>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-muted)]">Amount</span>
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            {formatCurrency(invoice.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-muted)]">Due Date</span>
                                        <span className="text-[var(--text-secondary)]">
                                            {formatDate(invoice.dueDate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add Invoice Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Create Invoice"
                    description="Create a new invoice for your client"
                    size="lg"
                >
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Client Name" placeholder="Enter client name" />
                            <Input label="Client Email" placeholder="client@example.com" type="email" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Amount" placeholder="0.00" type="number" />
                            <Input label="Due Date" type="date" />
                        </div>
                        <Input label="Description" placeholder="Invoice description..." />
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
                                Cancel
                            </Button>
                            <Button type="submit">Create Invoice</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
