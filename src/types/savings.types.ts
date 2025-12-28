export interface SavingsGoal {
  _id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  targetDate?: string;
  priority: 'low' | 'medium' | 'high';
  currentAmount: number;
  linkedAccountId?: string | BankAccount;
  linkedWalletId?: string | CashWallet;
  accountType?: 'bank' | 'cash' | 'all';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currency: string;
  autoContribution?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  progress?: number; // Calculated field
}

export interface SavingsContribution {
  _id: string;
  goalId: string;
  userId: string;
  amount: number;
  contributionDate: string;
  transactionId?: string;
  sourceAccountId?: string;
  sourceAccountType?: 'bank' | 'cash';
  notes?: string;
  isAutoContribution?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalData {
  goalName: string;
  targetAmount: number;
  targetDate?: string;
  priority?: 'low' | 'medium' | 'high';
  linkedAccountId?: string;
  linkedWalletId?: string;
  accountType?: 'bank' | 'cash' | 'all';
  currency?: string;
  autoContribution?: number;
  notes?: string;
}

export interface AddContributionData {
  amount: number;
  contributionDate?: string;
  sourceAccountId?: string;
  sourceAccountType?: 'bank' | 'cash';
  notes?: string;
  createTransaction?: boolean;
}

export interface DeviationAlert {
  isDeviating: boolean;
  expectedAmount: number;
  actualAmount: number;
  deviationPercentage: number;
  message?: string;
}

// Helper types
interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
}

interface CashWallet {
  _id: string;
  name: string;
}

