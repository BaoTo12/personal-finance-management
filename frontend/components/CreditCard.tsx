import React from 'react';
import { CardDetails } from '../types';
import { clsx } from 'clsx';
import { Wifi, Lock } from 'lucide-react';

interface CreditCardProps {
  card: CardDetails;
  onFreeze?: (cardId: string) => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({ card, onFreeze }) => {
  const isPrimary = card.variant === 'primary';
  const cardColor = card.color || (isPrimary ? 'from-[#d4fc79] to-[#96e6a1]' : 'from-[#434343] to-[#000000]');
  
  // Determine if card has light background colors (green, yellow, pink, purple gradients)
  const isLightBackground = cardColor.includes('#d4fc79') || // Green
                            cardColor.includes('#f093fb') || // Pink
                            cardColor.includes('#4facfe') || // Blue
                            cardColor.includes('#43e97b') || // Light green
                            cardColor.includes('#fa709a') || // Light pink
                            cardColor.includes('#a8edea') || // Cyan
                            cardColor.includes('#ffd89b');   // Yellow
  
  // WCAG AA compliant text colors with better contrast ratio (4.5:1)
  const textColorClass = isLightBackground ? 'text-gray-900' : 'text-white';
  const subtextColorClass = isLightBackground ? 'text-gray-800' : 'text-white/90';
  const labelColorClass = isLightBackground ? 'text-gray-700' : 'text-white/70';

  return (
    <div 
      className={clsx(
        "relative w-full aspect-[1.586/1] rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 shadow-xl",
        `bg-gradient-to-br ${cardColor}`,
        textColorClass,
        card.isFrozen && "opacity-60 grayscale",
        "hover:shadow-2xl hover:scale-[1.02]"
      )}
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl" style={{ mixBlendMode: 'overlay' }}></div>
      {/* Background Decorative Circles - Removed as requested */}

      {/* Frozen Overlay */}
      {card.isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-2">
            <Lock size={32} className="text-white" />
            <span className="text-white text-sm font-semibold">Card Frozen</span>
          </div>
        </div>
      )}

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <span className={clsx("text-xs font-medium mb-1", labelColorClass)}>
            {card.alias || 'Balance'}
          </span>
          <span className={clsx("text-3xl font-bold tracking-tight", textColorClass)}>${card.balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2">
           <div className={clsx(
             "w-10 h-8 rounded flex items-center justify-center border",
             isLightBackground ? "bg-yellow-500/30 border-yellow-600/40" : "bg-yellow-400/20 border-yellow-400/30"
           )}>
             <div className={clsx(
               "w-6 h-4 rounded-sm",
               isLightBackground ? "bg-yellow-600/60" : "bg-yellow-400/50"
             )}></div>
           </div>
           <Wifi size={20} className="rotate-90 opacity-60" />
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1 flex-1">
             <div className={clsx("text-lg font-mono tracking-widest", textColorClass)}>{card.cardNumber}</div>
             <div className={clsx("text-sm font-medium", subtextColorClass)}>{card.holderName}</div>
          </div>
          <div className="flex flex-col items-end gap-1 min-w-[80px]">
            <span className={clsx("text-[10px] font-bold uppercase", labelColorClass)}>Exp Date</span>
            <span className={clsx("text-sm font-mono font-semibold", textColorClass)}>{card.expiryDate}</span>
            <span className={clsx("text-lg font-bold mt-1", textColorClass)}>{card.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};