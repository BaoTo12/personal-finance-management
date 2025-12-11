import React, { useState, useEffect, useMemo } from 'react';
import { X, CreditCard, Plus, Minus, DollarSign, AlertCircle, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { TransactionType } from '../types';
import { useAppStore } from '../store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSFER_CATEGORIES } from '../constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: {
    title: string;
    category: string;
    amount: number;
    type: TransactionType;
    cardId: string;
    notes?: string;
  }) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { cards } = useAppStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [notes, setNotes] = useState('');

  // Get categories based on transaction type
  const availableCategories = useMemo(() => {
    switch (type) {
      case TransactionType.INCOME:
        return INCOME_CATEGORIES;
      case TransactionType.TRANSFER:
        return TRANSFER_CATEGORIES;
      default:
        return EXPENSE_CATEGORIES;
    }
  }, [type]);

  // Reset category when type changes
  useEffect(() => {
    setCategory('');
  }, [type]);

  // Initialize selectedCardId when modal opens or cards change
  useEffect(() => {
    if (isOpen && cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id);
    }
  }, [isOpen, cards, selectedCardId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!title || !amount || !category || !selectedCardId) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate amount is positive
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    onSubmit({
      title,
      category,
      amount: parsedAmount,
      type,
      cardId: selectedCardId,
      notes: notes || undefined,
    });

    // Reset form
    setTitle('');
    setAmount('');
    setCategory('');
    setNotes('');
    setType(TransactionType.EXPENSE);
    setSelectedCardId(cards[0]?.id || '');
    onClose();
  };

  if (!isOpen) return null;

  // Check if there are no cards available
  if (cards.length === 0) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-dark-card rounded-3xl border border-white/10 w-full max-w-md shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-error" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No Cards Available</h3>
              <p className="text-text-2 text-sm">
                You need to add at least one card before creating a transaction.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-text-1 rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      style={{ margin: 0, padding: 0 }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-dark-card rounded-3xl border border-white/10 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">Add Transaction</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-text-2 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-text-2 mb-3">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType(TransactionType.EXPENSE)}
                className={clsx(
                  'p-3 rounded-xl border font-medium text-sm transition-all',
                  type === TransactionType.EXPENSE
                    ? 'bg-error/10 border-error text-error'
                    : 'bg-dark-bg border-white/5 text-text-2 hover:border-white/20'
                )}
              >
                <Minus size={16} className="inline mr-1" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.INCOME)}
                className={clsx(
                  'p-3 rounded-xl border font-medium text-sm transition-all',
                  type === TransactionType.INCOME
                    ? 'bg-success/10 border-success text-success'
                    : 'bg-dark-bg border-white/5 text-text-2 hover:border-white/20'
                )}
              >
                <Plus size={16} className="inline mr-1" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setType(TransactionType.TRANSFER)}
                className={clsx(
                  'p-3 rounded-xl border font-medium text-sm transition-all',
                  type === TransactionType.TRANSFER
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-dark-bg border-white/5 text-text-2 hover:border-white/20'
                )}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-2 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grocery Shopping"
              className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-2 mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" />
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text-2 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-dark-bg border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                required
              >
                <option value="" disabled className="text-text-3">
                  Select a category
                </option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-dark-bg text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            </div>
          </div>

          {/* Card Selection */}
          <div>
            <label htmlFor="card" className="block text-sm font-medium text-text-2 mb-2">
              Select Card
            </label>
            <div className="relative">
              <select
                id="card"
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-dark-bg border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                required
              >
                <option value="" disabled className="text-text-3">
                  Select a card
                </option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id} className="bg-dark-bg text-white">
                    {card.type} {card.cardNumber} - Balance: ${card.balance.toLocaleString()}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-2 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-text-1 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Add Transaction
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
