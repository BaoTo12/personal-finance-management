import { create } from "zustand";
import type { Transaction } from "@/types";

interface TransactionState {
    transactions: Transaction[];
    selectedTransaction: Transaction | null;
    isAddModalOpen: boolean;
    isEditModalOpen: boolean;
    filters: {
        dateFrom?: string;
        dateTo?: string;
        categoryId?: string;
        accountId?: string;
        type?: "debit" | "credit";
        searchQuery?: string;
    };
    setTransactions: (transactions: Transaction[]) => void;
    setSelectedTransaction: (transaction: Transaction | null) => void;
    openAddModal: () => void;
    closeAddModal: () => void;
    openEditModal: (transaction: Transaction) => void;
    closeEditModal: () => void;
    setFilters: (filters: Partial<TransactionState["filters"]>) => void;
    clearFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    selectedTransaction: null,
    isAddModalOpen: false,
    isEditModalOpen: false,
    filters: {},
    setTransactions: (transactions) => set({ transactions }),
    setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
    openAddModal: () => set({ isAddModalOpen: true }),
    closeAddModal: () => set({ isAddModalOpen: false }),
    openEditModal: (transaction) =>
        set({ selectedTransaction: transaction, isEditModalOpen: true }),
    closeEditModal: () =>
        set({ selectedTransaction: null, isEditModalOpen: false }),
    setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
    clearFilters: () => set({ filters: {} }),
}));
