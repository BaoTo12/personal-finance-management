

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MOCK_TRANSACTIONS, MOCK_CARDS } from '../constants';
import { CreditCard } from '../components/CreditCard';
import { FinancialChart } from '../components/FinancialChart';
import { TransactionItem } from '../components/TransactionItem';
import { ArrowUpRight, ArrowDownLeft, Wallet, Plus, MoreHorizontal, ArrowRight, TrendingUp } from 'lucide-react';
import { IconBox } from '../components/ui/IconBox';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';

export default function DashboardPage() {
  const { getTotalBalance, cards } = useAppStore();
  
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => Promise.resolve(MOCK_TRANSACTIONS),
    initialData: MOCK_TRANSACTIONS
  });

  // Calculate totals for display
  const totalIncome = 42593.00;
  const totalExpense = 12405.00;
  const totalBalance = getTotalBalance();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 pb-8">
      
      {/* Main Content Area (Left - 8 Cols) */}
      <div className="xl:col-span-8 space-y-6 lg:space-y-8">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Total Balance */}
          <div className="bg-dark-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wallet size={80} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Wallet size={20} />
                   </div>
                   <span className="text-text-2 text-sm font-medium">Total Balance</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">${totalBalance.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                   <span className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <TrendingUp size={12} /> +2.4%
                   </span>
                   <span className="text-text-3 text-xs">from last month</span>
                </div>
             </div>
          </div>

          {/* Income */}
          <div className="bg-dark-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowUpRight size={80} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-success/10 rounded-xl text-success">
                      <ArrowUpRight size={20} />
                   </div>
                   <span className="text-text-2 text-sm font-medium">Total Income</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">${totalIncome.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                   <span className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <TrendingUp size={12} /> +12%
                   </span>
                   <span className="text-text-3 text-xs">from last month</span>
                </div>
             </div>
          </div>

          {/* Expense */}
          <div className="bg-dark-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowDownLeft size={80} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-error/10 rounded-xl text-error">
                      <ArrowDownLeft size={20} />
                   </div>
                   <span className="text-text-2 text-sm font-medium">Total Expense</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">${totalExpense.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                   <span className="bg-error/10 text-error text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <TrendingUp size={12} className="rotate-180" /> +5%
                   </span>
                   <span className="text-text-3 text-xs">from last month</span>
                </div>
             </div>
          </div>
        </div>

        {/* Analytics Chart Section */}
        <div className="bg-dark-card rounded-3xl p-6 md:p-8 border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Financial Analytics</h3>
              <p className="text-sm text-text-2 mt-1">Overview of your income and expenses</p>
            </div>
            <div className="flex bg-dark-bg p-1 rounded-xl border border-white/5">
               {['Weekly', 'Monthly', 'Yearly'].map((t, i) => (
                 <button key={t} className={clsx("px-4 py-2 text-xs font-semibold rounded-lg transition-all", i === 1 ? "bg-primary text-text-1 shadow-md" : "text-text-2 hover:text-white")}>
                   {t}
                 </button>
               ))}
            </div>
          </div>
          <FinancialChart />
        </div>

        {/* Recent Transactions List */}
        <div className="bg-dark-card rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
             <div>
               <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
               <p className="text-sm text-text-2">Latest financial activity</p>
             </div>
             <Link to="/transactions" className="p-2 hover:bg-white/5 rounded-xl text-text-2 hover:text-white transition-colors">
                <ArrowRight size={20} />
             </Link>
          </div>
          <div className="divide-y divide-white/5">
            {transactions?.slice(0, 5).map(tx => (
               <div key={tx.id}>
                  <TransactionItem transaction={tx} />
               </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar (Right - 4 Cols) */}
      <div className="xl:col-span-4 space-y-6 lg:space-y-8">
        
        {/* My Cards Section */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-white">My Cards</h3>
              <button className="text-sm font-semibold text-primary hover:underline">+ Add Card</button>
           </div>
           
           <div className="space-y-4">
              {cards.map((card, idx) => (
                 <div key={card.id} className={clsx("transition-transform duration-300 hover:scale-[1.02]", idx > 0 ? "opacity-90 hover:opacity-100" : "")}>
                   <CreditCard card={card} />
                 </div>
              ))}
           </div>
        </div>

        {/* Quick Transfer Widget */}
        <div className="bg-dark-card rounded-3xl p-6 border border-white/5 relative overflow-hidden">
             {/* Background Gradients */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
             
             <h3 className="text-lg font-bold text-white mb-6 relative z-10">Quick Transfer</h3>
             
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                   <button className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-primary/50 transition-all group">
                      <Plus size={24} className="text-text-2 group-hover:text-primary" />
                   </button>
                   {[1,2,3,4,5].map((_, i) => (
                     <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="w-14 h-14 rounded-full p-1 border-2 border-transparent group-hover:border-primary/50 transition-all">
                          <img src={`https://picsum.photos/seed/${i+200}/100`} className="w-full h-full rounded-full object-cover" alt="user"/>
                        </div>
                        <span className="text-[10px] font-medium text-text-2 group-hover:text-white">User {i+1}</span>
                     </div>
                   ))}
                </div>

                <div className="space-y-3">
                   <div className="text-xs font-medium text-text-2 uppercase">Amount</div>
                   <div className="flex items-center gap-3">
                     <div className="flex-1 h-14 bg-dark-bg rounded-2xl flex items-center px-4 border border-white/5 focus-within:border-primary/50 transition-colors">
                        <span className="text-text-2 font-bold mr-2">$</span>
                        <input type="number" className="bg-transparent w-full text-lg font-bold text-white placeholder-text-3 outline-none" placeholder="0.00" />
                     </div>
                     <button className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-text-1 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        <ArrowRight size={24} />
                     </button>
                   </div>
                </div>
             </div>
        </div>

        {/* Upcoming Payments (Mini) */}
        <div className="bg-dark-card rounded-3xl p-6 border border-white/5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Upcoming</h3>
              <button className="p-1 text-text-2 hover:text-white"><MoreHorizontal size={20}/></button>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-bold text-xs flex-col">
                    <span>Oct</span>
                    <span className="text-lg">25</span>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-semibold text-white">Figma Subscription</h4>
                    <p className="text-xs text-text-2">Software • Monthly</p>
                 </div>
                 <div className="text-white font-bold">-$15.00</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-bold text-xs flex-col">
                    <span>Oct</span>
                    <span className="text-lg">28</span>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-semibold text-white">Netflix Premium</h4>
                    <p className="text-xs text-text-2">Entertainment • Monthly</p>
                 </div>
                 <div className="text-white font-bold">-$22.99</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
