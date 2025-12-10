
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOCK_TRANSACTIONS } from '../../constants';
import { TransactionItem } from '../../components/TransactionItem';
import { Search, Filter, Download, Calendar, X, ChevronDown, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { TransactionType } from '../../types';

export default function TransactionsPage() {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => Promise.resolve([...MOCK_TRANSACTIONS, ...MOCK_TRANSACTIONS, ...MOCK_TRANSACTIONS]), // Duplicated for demo scroll
    initialData: MOCK_TRANSACTIONS
  });

  // Extract Unique Categories dynamically
  const categories = useMemo(() => {
    if (!transactions) return [];
    const uniqueCats = Array.from(new Set(transactions.map(t => t.category)));
    return ['All', ...uniqueCats.sort()];
  }, [transactions]);

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(tx => {
      // 1. Search (Title or Recipient)
      const matchesSearch = 
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (tx.recipient && tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Type Filter
      const matchesType = typeFilter === 'All' || 
                          (typeFilter === 'Income' && tx.type === TransactionType.INCOME) ||
                          (typeFilter === 'Expense' && tx.type === TransactionType.EXPENSE) ||
                          (typeFilter === 'Transfer' && tx.type === TransactionType.TRANSFER);

      // 3. Category Filter
      const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;

      // 4. Date Range Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const txDate = new Date(tx.date).getTime();
        if (startDate) {
          matchesDate = matchesDate && txDate >= new Date(startDate).getTime();
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the full end day
          matchesDate = matchesDate && txDate <= end.getTime();
        }
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const activeFiltersCount = [
    typeFilter !== 'All',
    categoryFilter !== 'All',
    startDate !== '',
    endDate !== ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-text-2 text-sm mt-1">Manage and track your financial history</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-card border border-white/10 rounded-xl text-sm font-medium text-text-2 hover:text-white hover:border-white/20 transition-all">
            <Download size={16} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-text-1 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <Filter size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-dark-card p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search */}
          <div className="relative flex-1">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by name or recipient..." 
               className="w-full h-12 bg-dark-bg border border-white/5 rounded-2xl pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-3"
             />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap gap-3">
            
            {/* Type Select */}
            <div className="relative group">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-12 pl-4 pr-10 bg-dark-bg border border-white/5 rounded-2xl text-sm text-white appearance-none focus:outline-none focus:border-primary/50 cursor-pointer min-w-[140px]"
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Transfer">Transfer</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            </div>

            {/* Category Select */}
            <div className="relative group">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-12 pl-4 pr-10 bg-dark-bg border border-white/5 rounded-2xl text-sm text-white appearance-none focus:outline-none focus:border-primary/50 cursor-pointer min-w-[160px]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-2 bg-dark-bg border border-white/5 rounded-2xl px-3 h-12">
               <Calendar size={16} className="text-text-3" />
               <input 
                 type="date" 
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none w-28 placeholder-text-3 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                 placeholder="Start Date"
               />
               <span className="text-text-3">-</span>
               <input 
                 type="date" 
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none w-28 placeholder-text-3 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
               />
            </div>

            {/* Reset Button */}
            {(activeFiltersCount > 0 || searchTerm) && (
              <button 
                onClick={clearFilters}
                className="h-12 px-4 flex items-center gap-2 bg-error/10 text-error rounded-2xl text-sm font-medium hover:bg-error/20 transition-colors"
              >
                <X size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <h3 className="text-lg font-bold text-white">History</h3>
             <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-text-2 border border-white/5">
                {filteredTransactions.length} items
             </span>
           </div>
           
           {/* Sort (Visual Only for now) */}
           <button className="flex items-center gap-1 text-xs font-medium text-text-2 hover:text-white">
              Sort by: Date <ChevronDown size={12} />
           </button>
        </div>

        <div className="divide-y divide-white/5">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, idx) => (
               <div key={`${tx.id}-${idx}`}>
                  <TransactionItem transaction={tx} />
               </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-text-3" />
              </div>
              <h3 className="text-white font-semibold text-lg">No transactions found</h3>
              <p className="text-text-2 text-sm mt-1 max-w-xs">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-6 flex items-center gap-2 text-primary font-medium text-sm hover:underline"
              >
                <RefreshCw size={14} /> Clear all filters
              </button>
            </div>
          )}
        </div>
        
        {filteredTransactions.length > 0 && (
          <div className="p-4 text-center border-t border-white/5">
             <button className="text-sm text-primary font-medium hover:underline">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
}
