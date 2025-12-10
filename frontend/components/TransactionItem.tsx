
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { IconBox } from './ui/IconBox';
import { ShoppingBasket, Briefcase, Tv, ArrowRightLeft, Cloud, ChevronDown, Download, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const iconMap: Record<string, React.ElementType> = {
  'ShoppingBasket': ShoppingBasket,
  'Briefcase': Briefcase,
  'Tv': Tv,
  'ArrowRightLeft': ArrowRightLeft,
  'Cloud': Cloud
};

export const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = iconMap[transaction.icon] || ShoppingBasket;
  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <div 
      className={clsx(
        "flex flex-col rounded-2xl transition-all duration-300 cursor-pointer border border-transparent mx-2 my-1",
        isExpanded ? "bg-white/5 border-white/5 shadow-lg" : "hover:bg-white/5 hover:scale-[1.01]"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main Header Row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <IconBox className={clsx(
            "w-12 h-12 rounded-2xl border transition-all",
             isExpanded 
               ? "bg-primary text-text-1 border-primary" 
               : "bg-dark-bg border-white/5 text-text-2 group-hover:border-primary/30 group-hover:text-primary"
          )}>
            <Icon size={20} />
          </IconBox>
          <div>
            <h4 className={clsx("font-semibold text-sm md:text-base transition-colors", isExpanded ? "text-primary" : "text-white")}>
              {transaction.title}
            </h4>
            <p className="text-xs text-text-2 mt-1">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className={clsx("font-bold text-sm md:text-base mb-1", isIncome ? "text-success" : "text-white")}>
              {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
            <div className={clsx("text-xs font-medium px-2 py-0.5 rounded-md inline-block", 
              transaction.status === 'Completed' ? "bg-success/10 text-success" : 
              transaction.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-error/10 text-error"
            )}>
              {transaction.status}
            </div>
          </div>
          <ChevronDown size={16} className={clsx("text-text-3 transition-transform duration-300", isExpanded && "rotate-180")} />
        </div>
      </div>

      {/* Expanded Details Section */}
      <div 
        className={clsx(
          "overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] px-4",
          isExpanded ? "max-h-60 opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-4 border-t border-white/10 flex flex-col gap-4 text-sm">
            {/* Grid for details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider">TxID</span>
                    <p className="text-white font-mono text-xs mt-1 truncate" title={transaction.id}>#{transaction.id.toUpperCase()}</p>
                </div>
                {transaction.recipient && (
                    <div>
                        <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Recipient</span>
                        <p className="text-white text-xs mt-1">{transaction.recipient}</p>
                    </div>
                )}
                {transaction.paymentMethod && (
                    <div>
                        <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Payment Method</span>
                        <p className="text-white text-xs mt-1">{transaction.paymentMethod}</p>
                    </div>
                )}
                <div>
                    <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider">Time</span>
                    <p className="text-white text-xs mt-1">
                      {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Notes Section */}
            {transaction.notes && (
               <div className="bg-dark-bg/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-text-3 tracking-wider block mb-1">Notes</span>
                  <p className="text-text-2 text-xs leading-relaxed">{transaction.notes}</p>
               </div>
            )}
             
             {/* Action Buttons */}
             <div className="flex gap-4 mt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors"
                >
                  <Download size={14} /> Download Receipt
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="flex items-center gap-2 text-xs font-bold text-text-2 hover:text-error transition-colors"
                >
                  <AlertCircle size={14} /> Report Issue
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};
