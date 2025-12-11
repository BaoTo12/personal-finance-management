import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CardDetails } from './types';
import { MOCK_CARDS } from './constants';

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedCardId: string | null;
  selectCard: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  cards: CardDetails[];
  updateCardBalance: (cardId: string, amount: number) => void;
  addMoneyToCard: (cardId: string, amount: number) => void;
  getTotalBalance: () => number;
  addCard: (card: Omit<CardDetails, 'id' | 'variant' | 'isFrozen'>) => void;
  toggleFreezeCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      selectedCardId: 'c1',
      selectCard: (id) => set({ selectedCardId: id }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
      cards: MOCK_CARDS,
      
      // Update card balance (for transactions - can be positive or negative)
      updateCardBalance: (cardId: string, amount: number) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? { ...card, balance: card.balance + amount }
              : card
          ),
        })),
      
      // Add money to card (always positive)
      addMoneyToCard: (cardId: string, amount: number) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId
              ? { ...card, balance: card.balance + Math.abs(amount) }
              : card
          ),
        })),
      
      // Calculate total balance from all cards
      getTotalBalance: () => {
        const state = get();
        return state.cards.reduce((total, card) => total + card.balance, 0);
      },

      // Add new card
      addCard: (card) =>
        set((state) => ({
          cards: [
            ...state.cards,
            {
              ...card,
              id: `c${Date.now()}`,
              variant: state.cards.length === 0 ? 'primary' : 'dark',
              isFrozen: false,
            },
          ],
        })),

      // Toggle freeze/unfreeze card
      toggleFreezeCard: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId ? { ...card, isFrozen: !card.isFrozen } : card
          ),
        })),

      // Remove card
      removeCard: (cardId) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== cardId),
        })),
    }),
    {
      name: 'maglo-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        isAuthenticated: state.isAuthenticated,
        cards: state.cards,
      }),
    }
  )
);