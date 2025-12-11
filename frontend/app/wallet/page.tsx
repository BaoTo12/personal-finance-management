

'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard } from '../../components/CreditCard';
import { AddCardModal } from '../../components/AddCardModal';
import { Plus, Settings2, ShieldCheck, Snowflake, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store';
import clsx from 'clsx';

export default function WalletPage() {
  const { cards, addCard, toggleFreezeCard } = useAppStore();
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Don't auto-select any card - let user choose

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipeRight();
      } else if (e.key === 'ArrowRight') {
        handleSwipeLeft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCardIndex, cards.length]);

  const handleAddCard = (cardData: {
    cardNumber: string;
    holderName: string;
    expiryDate: string;
    type: 'Visa' | 'MasterCard';
    alias: string;
    balance: number;
    color: string;
  }) => {
    addCard(cardData);
  };

  const handleCardClick = (index: number) => {
    // Toggle selection: if clicking the same card, deselect it
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(index);
    }
  };

  const handleSwipeLeft = () => {
    if (cards.length === 0) return;
    
    if (selectedCardIndex === null) {
      // No card selected - start from center card and go right
      const centerIndex = Math.floor(cards.length / 2);
      setSelectedCardIndex(centerIndex);
    } else if (selectedCardIndex < cards.length - 1) {
      setSelectedCardIndex(selectedCardIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (cards.length === 0) return;
    
    if (selectedCardIndex === null) {
      // No card selected - start from center card and go left
      const centerIndex = Math.floor(cards.length / 2);
      setSelectedCardIndex(centerIndex);
    } else if (selectedCardIndex > 0) {
      setSelectedCardIndex(selectedCardIndex - 1);
    }
  };

  const handleAddCardClick = () => {
    setSelectedCardIndex(null); // Deselect card before opening modal
    setIsAddCardModalOpen(true);
  };

  // Touch/Mouse swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleSwipeLeft();
    }
    if (isRightSwipe) {
      handleSwipeRight();
    }
  };

  // Mouse swipe handlers
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    
    // Start long-press timer
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      // Haptic feedback simulation (visual pulse)
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (mouseStart === null) return;
    
    // Cancel long press if moving
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setIsLongPressing(false);
    }
    
    setMouseEnd(e.clientX);
    setIsDragging(true);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (isLongPressing) {
      // Long press detected - could trigger special action
      setIsLongPressing(false);
      setMouseStart(null);
      setMouseEnd(null);
      setIsDragging(false);
      return;
    }
    
    if (mouseStart === null) return;
    
    if (mouseEnd === null || Math.abs(mouseStart - mouseEnd) < 5) {
      // This is a click, not a swipe - allow card selection
      setMouseStart(null);
      setMouseEnd(null);
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleSwipeLeft();
    } else if (isRightSwipe) {
      handleSwipeRight();
    }
    
    setMouseStart(null);
    setMouseEnd(null);
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
    setMouseStart(null);
    setMouseEnd(null);
    setIsDragging(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">My Wallet</h1>
         <button 
           onClick={handleAddCardClick}
           className="flex items-center gap-2 px-4 py-2 bg-primary text-text-1 hover:bg-primary/90 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
         >
            <Plus size={18} />
            Add New Card
         </button>
      </div>

      {/* Fanned Stack Display for Cards */}
      {cards.length > 0 ? (
        <div className="relative">
          {/* Fanned Cards Container - Horizontal with scroll-snap */}
          <div 
            className="relative h-[450px] flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
            style={{
              scrollSnapType: 'x mandatory',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          >
            {/* Left Navigation Button */}
            <button
              onClick={handleSwipeRight}
              disabled={selectedCardIndex === 0}
              className={clsx(
                "absolute left-4 z-50 w-12 h-12 rounded-full bg-dark-card border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110",
                selectedCardIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:border-primary"
              )}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            {/* Right Navigation Button */}
            <button
              onClick={handleSwipeLeft}
              disabled={selectedCardIndex === cards.length - 1}
              className={clsx(
                "absolute right-4 z-50 w-12 h-12 rounded-full bg-dark-card border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110",
                selectedCardIndex === cards.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary hover:border-primary"
              )}
            >
              <ChevronRight size={24} className="text-white" />
            </button>

            <div className="relative w-full">
              {cards.map((card, index) => {
                const totalCards = cards.length;
                const isSelected = selectedCardIndex === index;
                
                // Horizontal fan spread calculation
                const baseSpacing = 150;
                
                // Calculate position - selected card always at center
                let translateX, translateY, rotation, scale;
                
                if (isSelected) {
                  // Selected card is centered
                  translateX = 0;
                  translateY = -40;
                  rotation = 0;
                  scale = 1.15;
                } else if (selectedCardIndex !== null) {
                  // Calculate position relative to selected card
                  const offsetFromSelected = index - selectedCardIndex;
                  translateX = offsetFromSelected * baseSpacing;
                  translateY = Math.abs(offsetFromSelected) * 10;
                  rotation = offsetFromSelected * 3;
                  scale = 0.9;
                } else {
                  // No selection - spread normally
                  const centerIndex = (totalCards - 1) / 2;
                  const offsetFromCenter = index - centerIndex;
                  translateX = offsetFromCenter * baseSpacing;
                  translateY = Math.abs(offsetFromCenter) * 5;
                  rotation = offsetFromCenter * 3;
                  scale = 1;
                }
                
                // Z-index management
                const zIndex = isSelected ? 100 : 50 - Math.abs(index - (selectedCardIndex ?? Math.floor(totalCards / 2)));

                return (
                  <div
                    key={card.id}
                    className={clsx(
                      "absolute left-1/2 top-1/2 w-[380px] cursor-pointer transition-all duration-700 ease-out",
                      isSelected && "shadow-2xl shadow-primary/30"
                    )}
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
                      zIndex: zIndex,
                      scrollSnapAlign: 'center',
                    }}
                    onClick={(e) => {
                      if (!isDragging && mouseEnd === null && !isLongPressing) {
                        e.stopPropagation();
                        handleCardClick(index);
                      }
                    }}
                  >
                    <CreditCard card={card} />
                    
                    {/* Card Actions - Show when selected with slide-up animation */}
                    {isSelected && (
                      <div className="mt-6 grid grid-cols-3 gap-3 opacity-0 animate-slide-up">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Settings action
                          }}
                          className="flex flex-col items-center justify-center gap-2 py-4 bg-dark-card border border-white/5 rounded-2xl hover:border-primary/50 hover:bg-dark-hover transition-all duration-300 group transform hover:scale-105"
                        >
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                             <Settings2 size={20} className="text-primary group-hover:rotate-90 transition-transform duration-500" />
                           </div>
                           <span className="text-xs text-text-2 font-medium">Settings</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Security action
                          }}
                          className="flex flex-col items-center justify-center gap-2 py-4 bg-dark-card border border-white/5 rounded-2xl hover:border-primary/50 hover:bg-dark-hover transition-all duration-300 group transform hover:scale-105"
                        >
                           <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors duration-300">
                             <ShieldCheck size={20} className="text-success group-hover:scale-110 transition-transform duration-300" />
                           </div>
                           <span className="text-xs text-text-2 font-medium">Security</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFreezeCard(card.id);
                          }}
                          className={clsx(
                            "flex flex-col items-center justify-center gap-2 py-4 bg-dark-card border rounded-2xl transition-all duration-300 group transform hover:scale-105",
                            card.isFrozen 
                              ? "border-error/50 bg-error/10 hover:bg-error/20" 
                              : "border-white/5 hover:border-error/50 hover:bg-dark-hover"
                          )}
                        >
                           <div className={clsx(
                             "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                             card.isFrozen ? "bg-error/20 group-hover:bg-error/30" : "bg-error/10 group-hover:bg-error/20"
                           )}>
                             <Snowflake size={20} className={clsx(
                               "transition-all duration-500",
                               card.isFrozen ? "text-error rotate-180" : "text-error group-hover:rotate-180"
                             )} />
                           </div>
                           <span className={clsx(
                             "text-xs font-medium",
                             card.isFrozen ? "text-error" : "text-text-2"
                           )}>
                             {card.isFrozen ? 'Unfreeze' : 'Freeze'}
                           </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions & Card Indicator */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCardIndex(index)}
                  className={clsx(
                    "transition-all duration-300 rounded-full",
                    selectedCardIndex === index 
                      ? "w-8 h-2 bg-primary" 
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-dark-card flex items-center justify-center">
              <Plus size={48} className="text-text-3" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Cards Yet</h3>
            <p className="text-text-2 mb-4">Add your first card to get started</p>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="px-6 py-3 bg-primary text-text-1 rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Add Your First Card
            </button>
          </div>
        </div>
      )}

      <div className="bg-dark-card rounded-3xl p-6 md:p-8 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-6">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-bg rounded-2xl">
            <div className="text-text-2 text-sm mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-white">{cards.length}</div>
          </div>
          <div className="p-4 bg-dark-bg rounded-2xl">
            <div className="text-text-2 text-sm mb-1">Active Cards</div>
            <div className="text-2xl font-bold text-success">{cards.filter(c => !c.isFrozen).length}</div>
          </div>
          <div className="p-4 bg-dark-bg rounded-2xl">
            <div className="text-text-2 text-sm mb-1">Frozen Cards</div>
            <div className="text-2xl font-bold text-error">{cards.filter(c => c.isFrozen).length}</div>
          </div>
        </div>
      </div>

      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSubmit={handleAddCard}
      />
    </div>
  );
}
