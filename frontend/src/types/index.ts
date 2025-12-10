// User Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    locale: string;
    currencyCode: string;
    createdAt: string;
}

// Account Types
export type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment" | "loan";

export interface Account {
    id: string;
    userId: string;
    name: string;
    accountType: AccountType;
    currencyCode: string;
    initialBalance: number;
    currentBalance: number;
    institutionName?: string;
    accountNumberLast4?: string;
    color: string;
    icon?: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

// Transaction Types
export type TransactionType = "debit" | "credit";

export interface Transaction {
    id: string;
    userId: string;
    accountId: string;
    categoryId?: string;
    transactionType: TransactionType;
    amount: number;
    transactionDate: string;
    payee: string;
    description?: string;
    isRecurring: boolean;
    createdAt: string;
    category?: Category;
    account?: Account;
}

// Category Types
export type CategoryType = "expense" | "income";

export interface Category {
    id: string;
    userId?: string;
    name: string;
    categoryType: CategoryType;
    parentId?: string;
    color: string;
    icon?: string;
    isSystem: boolean;
}

// Budget Types
export type PeriodType = "weekly" | "monthly" | "quarterly" | "yearly";

export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    name?: string;
    amount: number;
    periodType: PeriodType;
    startDate: string;
    endDate?: string;
    alertThresholdPercentage: number;
    isActive: boolean;
    spentAmount?: number;
    category?: Category;
}

// Invoice Types
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
    id: string;
    userId: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    status: InvoiceStatus;
    dueDate: string;
    issueDate: string;
    description?: string;
    items: InvoiceItem[];
    createdAt: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// Wallet/Card Types
export type CardType = "visa" | "mastercard" | "amex" | "discover";

export interface WalletCard {
    id: string;
    userId: string;
    accountId: string;
    cardType: CardType;
    cardNumber: string; // Last 4 digits
    cardholderName: string;
    expiryDate: string;
    color: string;
    gradientColors: [string, string];
    isDefault: boolean;
}

// Dashboard Types
export interface DashboardStats {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    monthlyChange: number;
}

export interface SpendingByCategory {
    categoryId: string;
    categoryName: string;
    color: string;
    amount: number;
    percentage: number;
}

export interface MonthlyTrend {
    month: string;
    income: number;
    expenses: number;
}

// Navigation Types
export interface NavItem {
    label: string;
    href: string;
    icon: string;
}

// Notification Types
export interface Notification {
    id: string;
    userId: string;
    type: "info" | "warning" | "success" | "error";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
