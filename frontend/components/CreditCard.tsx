import React from 'react';
import { CardDetails } from '../types';
import { clsx } from 'clsx';
import { Wifi, Disc } from 'lucide-react';

interface CreditCardProps {
  card: CardDetails;
}

export const CreditCard: React.FC<CreditCardProps> = ({ card }) => {
  const isPrimary = card.variant === 'primary';

  return (
    <div 
      className={clsx(
        "relative w-full aspect-[1.586/1] rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-transform hover:scale-[1.02] duration-300 shadow-xl",
        isPrimary 
          ? "bg-gradient-to-br from-[#d4fc79] to-[#96e6a1] text-text-1" 
          : "bg-gradient-to-br from-[#434343] to-[#000000] text-white border border-white/10"
      )}
    >
      {/* Background Decorative Circles */}
      <div className={clsx("absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-30", isPrimary ? "bg-white" : "bg-primary")}></div>
      <div className={clsx("absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-3xl opacity-30", isPrimary ? "bg-secondary" : "bg-secondary")}></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <span className={clsx("text-xs font-medium opacity-70 mb-1", isPrimary ? "text-text-1" : "text-text-2")}>Current Balance</span>
          <span className="text-3xl font-bold tracking-tight">${card.balance.toLocaleString()}</span>
        </div>
        <div className="flex gap-1">
             <Disc size={32} className={isPrimary ? "text-text-1" : "text-white"} />
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2">
           <div className="w-10 h-8 bg-yellow-400/20 rounded flex items-center justify-center border border-yellow-400/30">
             <div className="w-6 h-4 bg-yellow-400/50 rounded-sm"></div>
           </div>
           <Wifi size={20} className="rotate-90 opacity-60" />
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <div className="text-lg font-mono tracking-widest">{card.cardNumber}</div>
             <div className="text-sm font-medium opacity-80">{card.holderName}</div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase opacity-60">Exp Date</span>
            <span className="text-sm font-medium font-mono">{card.expiryDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};