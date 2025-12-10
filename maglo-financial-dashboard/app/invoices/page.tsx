
'use client';

import React from 'react';
import { MOCK_INVOICES } from '../../constants';
import { clsx } from 'clsx';
import { FileText, MoreVertical, Download } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">Invoices</h1>
         <button className="px-4 py-2 bg-primary text-text-1 font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:opacity-90">
            + Create Invoice
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-dark-card p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-text-2 text-xs font-medium uppercase">Total Outstanding</span>
            <div className="text-2xl font-bold text-white">$12,450.00</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="w-[60%] h-full bg-secondary"></div>
            </div>
         </div>
         <div className="bg-dark-card p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-text-2 text-xs font-medium uppercase">In Draft</span>
            <div className="text-2xl font-bold text-white">$2,100.00</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="w-[30%] h-full bg-text-2"></div>
            </div>
         </div>
         <div className="bg-dark-card p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-text-2 text-xs font-medium uppercase">Overdue</span>
            <div className="text-2xl font-bold text-white">$1,200.00</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="w-[15%] h-full bg-error"></div>
            </div>
         </div>
         <div className="bg-dark-card p-4 rounded-2xl border border-white/5 space-y-2">
            <span className="text-text-2 text-xs font-medium uppercase">Paid this month</span>
            <div className="text-2xl font-bold text-white">$8,500.00</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="w-[80%] h-full bg-primary"></div>
            </div>
         </div>
      </div>

      <div className="bg-dark-card rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-white/5 text-text-2 text-xs uppercase tracking-wider border-b border-white/5">
                   <th className="p-4 pl-6 font-medium">Invoice ID</th>
                   <th className="p-4 font-medium">Client</th>
                   <th className="p-4 font-medium">Due Date</th>
                   <th className="p-4 font-medium">Amount</th>
                   <th className="p-4 font-medium">Status</th>
                   <th className="p-4 font-medium text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {MOCK_INVOICES.map(inv => (
                   <tr key={inv.id} className="hover:bg-dark-hover transition-colors group">
                      <td className="p-4 pl-6 text-sm font-mono text-text-2">#{inv.id}</td>
                      <td className="p-4">
                         <div className="flex items-center gap-3">
                            <img src={inv.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                            <span className="font-semibold text-white text-sm">{inv.clientName}</span>
                         </div>
                      </td>
                      <td className="p-4 text-sm text-text-2">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-bold text-white">${inv.amount.toFixed(2)}</td>
                      <td className="p-4">
                         <span className={clsx("px-2.5 py-1 rounded-lg text-xs font-semibold border", 
                            inv.status === 'Paid' ? "bg-success/10 text-success border-success/20" :
                            inv.status === 'Unpaid' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            "bg-error/10 text-error border-error/20"
                         )}>
                            {inv.status}
                         </span>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white/10 rounded-lg text-text-2"><Download size={16} /></button>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-text-2"><MoreVertical size={16} /></button>
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
