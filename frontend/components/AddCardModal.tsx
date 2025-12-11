import React, { useState, useEffect } from 'react';
import { X, CreditCard, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { CARD_COLORS } from '../constants';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: {
    cardNumber: string;
    holderName: string;
    expiryDate: string;
    type: 'Visa' | 'MasterCard';
    alias: string;
    balance: number;
    color: string;
  }) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [type, setType] = useState<'Visa' | 'MasterCard'>('Visa');
  const [alias, setAlias] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!cardNumber || !holderName || !expiryDate || !alias || !balance) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate balance is positive
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      alert('Please enter a valid balance');
      return;
    }

    // Mask card number (show last 4 digits)
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const maskedNumber = `**** **** **** ${last4}`;

    onSubmit({
      cardNumber: maskedNumber,
      holderName,
      expiryDate,
      type,
      alias,
      balance: parsedBalance,
      color: selectedColor,
    });

    // Reset form
    setCardNumber('');
    setHolderName('');
    setExpiryDate('');
    setType('Visa');
    setAlias('');
    setBalance('');
    setSelectedColor(CARD_COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[200] bg-black/60 backdrop-blur-sm overflow-y-auto"
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
            <h2 className="text-xl font-bold text-white">Add New Card</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-text-2 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Card Alias */}
            <div>
              <label htmlFor="alias" className="block text-sm font-medium text-text-2 mb-2">
                Card Nickname / Alias
              </label>
              <input
                id="alias"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., Main Card, Savings, Work Card"
                className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-text-2 mb-2">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                required
              />
            </div>

            {/* Holder Name */}
            <div>
              <label htmlFor="holderName" className="block text-sm font-medium text-text-2 mb-2">
                Card Holder Name
              </label>
              <input
                id="holderName"
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-text-2 mb-2">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors font-mono"
                  maxLength={5}
                  required
                />
              </div>

              {/* Card Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-2 mb-2">
                  Card Type
                </label>
                <div className="relative">
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Visa' | 'MasterCard')}
                    className="w-full px-4 py-3 pr-10 bg-dark-bg border border-white/5 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="MasterCard">MasterCard</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Balance */}
            <div>
              <label htmlFor="balance" className="block text-sm font-medium text-text-2 mb-2">
                Initial Balance
              </label>
              <input
                id="balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-dark-bg border border-white/5 rounded-xl text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-text-2 mb-3">
                Card Color
              </label>
              <div className="grid grid-cols-5 gap-3">
                {CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={clsx(
                      'h-12 rounded-xl transition-all',
                      `bg-gradient-to-br ${color}`,
                      selectedColor === color
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark-card scale-110'
                        : 'hover:scale-105'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-primary text-text-1 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Add Card
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
