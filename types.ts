export enum DebtStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  UP_TO_DATE = 'UP_TO_DATE',
  SPC = 'SPC'
}

export interface Debt {
  id: string;
  sequenceNumber?: number;
  customerName: string; // Credor / Banco / Cartão
  customerCode: string;
  customerDocument?: string; // CPF / CNPJ
  whatsapp?: string;
  amount: number; // Valor Atual
  originalAmount: number; // Valor Original
  dueDate: string; // Data de Vencimento
  registrationDate: string; // DATA DA DÍVIDA (FIXA)
  paymentDate?: string; // Data do pagamento final
  interestRate?: number;
  interestAmount?: number;
  status: DebtStatus; // EM ABERTO / QUITADA
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
