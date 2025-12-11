import { Transaction, TransactionType, MonthlyStat, CardDetails } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    title: 'Adobe Creative Cloud',
    category: 'Subscription',
    amount: 54.99,
    date: '2023-10-24T10:00:00',
    type: TransactionType.EXPENSE,
    status: 'Completed',
    icon: 'Cloud',
    notes: 'Monthly license payment for CC All Apps',
    paymentMethod: 'Visa •••• 4582'
  },
  {
    id: 't2',
    title: 'Upwork Freelance',
    category: 'Income',
    amount: 1250.00,
    date: '2023-10-23T14:30:00',
    type: TransactionType.INCOME,
    status: 'Completed',
    icon: 'Briefcase',
    notes: 'Project milestone: Website Redesign',
    paymentMethod: 'Direct Deposit'
  },
  {
    id: 't3',
    title: 'Whole Foods Market',
    category: 'Groceries',
    amount: 142.80,
    date: '2023-10-22T18:15:00',
    type: TransactionType.EXPENSE,
    status: 'Completed',
    icon: 'ShoppingBasket',
    notes: 'Weekly groceries',
    paymentMethod: 'MasterCard •••• 9921'
  },
  {
    id: 't4',
    title: 'Netflix Standard',
    category: 'Entertainment',
    amount: 15.99,
    date: '2023-10-21T09:00:00',
    type: TransactionType.EXPENSE,
    status: 'Pending',
    icon: 'Tv',
    notes: 'Recurring subscription',
    paymentMethod: 'Visa •••• 4582'
  },
  {
    id: 't5',
    title: 'Transfer to Savings',
    category: 'Transfer',
    amount: 500.00,
    date: '2023-10-20T11:20:00',
    type: TransactionType.TRANSFER,
    status: 'Completed',
    recipient: 'Vault Savings',
    icon: 'ArrowRightLeft',
    notes: 'Automatic savings rule',
    paymentMethod: 'Internal Transfer'
  },
  {
    id: 't6',
    title: 'Spotify Premium',
    category: 'Entertainment',
    amount: 12.99,
    date: '2023-10-19T09:00:00',
    type: TransactionType.EXPENSE,
    status: 'Completed',
    icon: 'Tv',
    paymentMethod: 'Visa •••• 4582'
  },
  {
    id: 't7',
    title: 'Client Payment - TechCorp',
    category: 'Income',
    amount: 3200.00,
    date: '2023-10-18T16:00:00',
    type: TransactionType.INCOME,
    status: 'Completed',
    icon: 'Briefcase',
    notes: 'Invoice #INV-2023-001 settlement',
    paymentMethod: 'Wire Transfer'
  }
];

export const MOCK_CHART_DATA: MonthlyStat[] = [
  { month: 'Jan', income: 4500, expense: 3200 },
  { month: 'Feb', income: 5200, expense: 3500 },
  { month: 'Mar', income: 4800, expense: 4100 },
  { month: 'Apr', income: 6100, expense: 3800 },
  { month: 'May', income: 5500, expense: 4500 },
  { month: 'Jun', income: 6700, expense: 3900 },
  { month: 'Jul', income: 7200, expense: 4200 },
];

// Transaction categories
export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Subscription',
  'Travel',
  'Education',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Bonus',
  'Other'
];

export const TRANSFER_CATEGORIES = [
  'Transfer',
  'Savings',
  'Investment Transfer',
  'Other'
];

export const MOCK_CARDS: CardDetails[] = [
  {
    id: 'c1',
    balance: 24500.80,
    cardNumber: '**** **** **** 4582',
    holderName: 'Alex Morgan',
    expiryDate: '12/26',
    type: 'Visa',
    variant: 'primary'
  },
  {
    id: 'c2',
    balance: 5240.50,
    cardNumber: '**** **** **** 9921',
    holderName: 'Alex Morgan',
    expiryDate: '09/25',
    type: 'MasterCard',
    variant: 'dark'
  }
];