
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
}

export interface DashboardStats {
  totalOverdue: number;
  overdueCount: number;
  receivedThisMonth: number;
  toReceive: number;
  averageDelayDays: number;
}
