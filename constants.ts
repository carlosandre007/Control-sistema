
import { Debt, DebtStatus } from './types';

export const INITIAL_DEBTS: Debt[] = [
  {
    id: '1',
    customerName: 'Kelly Kal',
    customerCode: '#0060',
    amount: 1000.00,
    dueDate: '2024-12-20',
    status: DebtStatus.PENDING,
    isRecurring: true,
    avatarColor: 'bg-blue-500'
  },
  {
    id: '2',
    customerName: 'Andre Blu',
    customerCode: '#0023',
    amount: 500.00,
    dueDate: '2024-12-15',
    status: DebtStatus.PENDING,
    isRecurring: true,
    avatarColor: 'bg-yellow-500'
  },
  {
    id: '3',
    customerName: 'Cleo Shrin',
    customerCode: '#0042',
    amount: 200.00,
    dueDate: '2024-10-10',
    status: DebtStatus.PENDING,
    isRecurring: true,
    avatarColor: 'bg-purple-500'
  },
  {
    id: '4',
    customerName: 'Dansa Limited',
    customerCode: '#0073',
    amount: 1000.00,
    dueDate: '2021-12-01',
    status: DebtStatus.OVERDUE,
    isRecurring: true,
    avatarColor: 'bg-red-500'
  },
  {
    id: '5',
    customerName: 'Dansa Systems',
    customerCode: '#0074',
    amount: 500.00,
    dueDate: '2022-05-01',
    status: DebtStatus.OVERDUE,
    isRecurring: true,
    avatarColor: 'bg-pink-500'
  },
  {
    id: '6',
    customerName: 'Exemplo 100 + 30',
    customerCode: '#0100',
    amount: 100.00,
    dueDate: '2023-01-01',
    status: DebtStatus.OVERDUE,
    isRecurring: false,
    avatarColor: 'bg-orange-500'
  },
  {
    id: '7',
    customerName: 'Maria Silva',
    customerCode: '#0099',
    amount: 1000.00,
    dueDate: '2024-05-01',
    status: DebtStatus.PAID,
    paymentDate: '2024-05-10',
    isRecurring: true,
    avatarColor: 'bg-green-500'
  },
  {
    id: '8',
    customerName: 'Jose Santos',
    customerCode: '#0102',
    amount: 300.00,
    dueDate: '2024-05-15',
    status: DebtStatus.PENDING,
    isRecurring: false,
    avatarColor: 'bg-indigo-500'
  }
];
