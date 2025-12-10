
'use client';

import React from 'react';
import { MOCK_CARDS } from '../../constants';
import { CreditCard } from '../../components/CreditCard';
import { Plus, Settings2, ShieldCheck, Smartphone } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">My Wallet</h1>
         <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
            <Plus size={18} />
            Add New Card
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CARDS.map(card => (
          <div key={card.id} className="space-y-4">
             <CreditCard card={card} />
             <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center justify-center gap-1 py-3 bg-dark-card border border-white/5 rounded-xl hover:border-primary/50 hover:bg-dark-hover transition-all group">
                   <Settings2 size={18} className="text-text-2 group-hover:text-primary" />
                   <span className="text-[10px] text-text-2">Settings</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 py-3 bg-dark-card border border-white/5 rounded-xl hover:border-primary/50 hover:bg-dark-hover transition-all group">
                   <ShieldCheck size={18} className="text-text-2 group-hover:text-primary" />
                   <span className="text-[10px] text-text-2">Security</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-1 py-3 bg-dark-card border border-white/5 rounded-xl hover:border-primary/50 hover:bg-dark-hover transition-all group">
                   <Smartphone size={18} className="text-text-2 group-hover:text-primary" />
                   <span className="text-[10px] text-text-2">Freeze</span>
                </button>
             </div>
          </div>
        ))}
        
        {/* Add Card Placeholder */}
        <button className="relative w-full aspect-[1.586/1] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all group">
           <div className="w-16 h-16 rounded-full bg-dark-card flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} className="text-text-2" />
           </div>
           <span className="font-medium text-text-2">Add New Card</span>
        </button>
      </div>

      <div className="bg-dark-card rounded-3xl p-6 md:p-8 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6">Card Settings</h3>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-dark-bg rounded-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone size={20} />
                 </div>
                 <div>
                    <h4 className="font-semibold">Contactless Payment</h4>
                    <p className="text-xs text-text-2">Enable tap to pay</p>
                 </div>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
           </div>
           <div className="flex items-center justify-between p-4 bg-dark-bg rounded-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h4 className="font-semibold">Online Transactions</h4>
                    <p className="text-xs text-text-2">Enable payments on websites</p>
                 </div>
              </div>
              <div className="w-12 h-6 bg-dark-hover rounded-full relative cursor-pointer">
                 <div className="absolute left-1 top-1 w-4 h-4 bg-text-2 rounded-full shadow-sm"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
