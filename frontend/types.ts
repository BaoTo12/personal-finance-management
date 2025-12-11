import React from 'react';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: TransactionType;
  status: 'Completed' | 'Pending' | 'Failed';
  recipient?: string;
  icon: string;
  notes?: string;
  paymentMethod?: string;
  cardId?: string; // Card from which money is taken/added
}

export interface MonthlyStat {
  month: string;
  income: number;
  expense: number;
}

export interface CardDetails {
  id: string;
  balance: number;
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  type: 'Visa' | 'MasterCard';
  variant: 'primary' | 'dark';
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  isActive?: boolean;
}