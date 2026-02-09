export enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  UP_TO_DATE = 'UP_TO_DATE'
}

export interface Debt {
  id: string;
  sequenceNumber?: number;
  customerName: string;
  customerCode: string;
  whatsapp?: string;
  amount: number;
  dueDate: string;
  registrationDate?: string;
  paymentDate?: string;
  interestRate?: number;
  interestAmount?: number;
  status: DebtStatus;
  isRecurring: boolean;
  avatarColor: string;
  category?: string;
  description?: string;
}

export interface Transaction {
  id: string;
  createdAt: string;
  userId: string;
  chargeId: string;
  customerName: string;
  category: string;
  type: 'total_payment' | 'interest_payment';
  amount: number;
  transactionDate: string;
  description: string;
  paymentMethod?: string;
}

export interface DashboardStats {
  totalOverdue: number;
  overdueCount: number;
  receivedThisMonth: number;
  toReceive: number;
  averageDelayDays: number;
  totalPortfolio: number;
  totalClients: number;
  collectionEfficiency: number;
  activeCount: number;
  interestReceived: number;
}
