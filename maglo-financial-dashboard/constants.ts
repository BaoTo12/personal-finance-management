import { Transaction, TransactionType, MonthlyStat, CardDetails, Invoice } from './types';

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

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    clientName: 'Design Studio Inc.',
    amount: 2500.00,
    dueDate: '2023-11-05',
    status: 'Paid',
    avatarUrl: 'https://picsum.photos/seed/design/100'
  },
  {
    id: 'inv_002',
    clientName: 'TechFlow Systems',
    amount: 4800.50,
    dueDate: '2023-11-12',
    status: 'Unpaid',
    avatarUrl: 'https://picsum.photos/seed/tech/100'
  },
  {
    id: 'inv_003',
    clientName: 'Marketing Gurus',
    amount: 1200.00,
    dueDate: '2023-10-28',
    status: 'Overdue',
    avatarUrl: 'https://picsum.photos/seed/marketing/100'
  },
  {
    id: 'inv_004',
    clientName: 'Global Ventures',
    amount: 8500.00,
    dueDate: '2023-11-20',
    status: 'Unpaid',
    avatarUrl: 'https://picsum.photos/seed/global/100'
  }
];