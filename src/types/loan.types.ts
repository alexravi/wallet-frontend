export interface Loan {
  _id: string;
  userId: string;
  loanType: 'borrowed' | 'given' | 'hand';
  loanCategory: 'bank' | 'cash';
  principal: number;
  interestType: 'flat' | 'simple' | 'compound';
  interestRate: number;
  startDate: string;
  endDate?: string;
  linkedPersonId?: string | Person;
  linkedAccountId?: string | BankAccount;
  linkedWalletId?: string | CashWallet;
  accountType?: 'bank' | 'cash';
  status: 'active' | 'closed' | 'written-off';
  outstandingAmount: number;
  totalPaid: number;
  notes?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  _id: string;
  loanId: string;
  userId: string;
  paymentType: 'emi' | 'partial' | 'prepayment' | 'irregular';
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: string;
  transactionId?: string;
  emiScheduleId?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EMISchedule {
  _id: string;
  loanId: string | Loan;
  userId: string;
  emiNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'missed' | 'skipped';
  paymentId?: string | LoanPayment;
  paidDate?: string;
  isEarlyClosure?: boolean;
  penaltyAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanData {
  loanType: 'borrowed' | 'given' | 'hand';
  loanCategory: 'bank' | 'cash';
  principal: number;
  interestType?: 'flat' | 'simple' | 'compound';
  interestRate: number;
  startDate: string;
  endDate?: string;
  linkedPersonId?: string;
  linkedAccountId?: string;
  linkedWalletId?: string;
  notes?: string;
  currency?: string;
  numberOfEMIs?: number;
  emiAmount?: number;
}

export interface RecordPaymentData {
  paymentType: 'emi' | 'partial' | 'prepayment' | 'irregular';
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: string;
  emiScheduleId?: string;
  notes?: string;
}

export interface GenerateEMIScheduleData {
  numberOfEMIs: number;
  emiAmount?: number;
}

// Helper types
interface Person {
  _id: string;
  name: string;
}

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
}

interface CashWallet {
  _id: string;
  name: string;
}

