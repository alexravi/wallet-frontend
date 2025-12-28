export interface BankAccount {
  _id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  branchName?: string;
  ifscCode?: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'archived';
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashWallet {
  _id: string;
  userId: string;
  name: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'archived';
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  type: 'system' | 'custom';
  icon?: string;
  color?: string;
  isArchived: boolean;
  parentCategoryId?: string;
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  _id: string;
  userId: string;
  name: string;
  type: 'child' | 'friend' | 'employee' | 'family' | 'other';
  notes?: string;
  overallLimit?: number;
  limitPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  categoryLimits?: Array<{
    categoryId: string;
    amount: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  accountId: string;
  accountType: 'bank' | 'cash';
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  category?: string | Category;
  notes?: string;
  attachments?: string[];
  personId?: string | Person;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  referenceNumber?: string;
  duplicateCheckHash: string;
  transferToAccountId?: string;
  parentTransactionId?: string;
  groupId?: string;
  settlementId?: string;
  splitType?: 'none' | 'equal' | 'percentage' | 'custom';
  splitDetails?: Array<{
    personId: string;
    amount: number;
    percentage?: number;
  }>;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTransaction {
  _tempId?: string;
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  referenceNumber?: string;
  balance?: number;
  isDuplicate?: boolean;
  matchingTransactionId?: string;
}

export interface BankStatement {
  _id: string;
  userId: string;
  bankAccountId: string;
  fileName: string;
  fileType: 'pdf' | 'csv';
  filePath?: string;
  uploadDate: string;
  parseStatus: 'pending' | 'parsing' | 'completed' | 'failed';
  transactionCount: number;
  parsedTransactions: ParsedTransaction[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountListItem {
  id: string;
  name: string;
  type: 'bank' | 'cash';
  balance: number;
  currency: string;
}

export interface ReconciliationData {
  wallet: CashWallet;
  month: number;
  year: number;
  openingBalance: number;
  expectedBalance: number;
  actualBalance: number;
  discrepancy: number;
  transactions: Transaction[];
  summary: {
    totalCashIn: number;
    totalCashOut: number;
    totalTransfersIn: number;
    totalTransfersOut: number;
    transactionCount: number;
  };
}

export interface CreateBankAccountData {
  bankName: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  branchName?: string;
  ifscCode?: string;
  openingBalance: number;
  currency: string;
}

export interface UpdateBankAccountData {
  bankName?: string;
  accountNumber?: string;
  accountType?: 'savings' | 'checking' | 'current';
  branchName?: string;
  ifscCode?: string;
  openingBalance?: number;
  currency?: string;
}

export interface CreateCashWalletData {
  name: string;
  openingBalance: number;
  currency: string;
  color?: string;
  icon?: string;
}

export interface UpdateCashWalletData {
  name?: string;
  openingBalance?: number;
  currency?: string;
  color?: string;
  icon?: string;
}

export interface CreateTransactionData {
  accountId: string;
  accountType: 'bank' | 'cash';
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  category?: string;
  notes?: string;
  attachments?: string[];
  personId?: string;
  date: string;
  referenceNumber?: string;
  transferToAccountId?: string;
  groupId?: string;
}

export interface CashInData {
  walletId: string;
  amount: number;
  description: string;
  date: string;
  currency: string;
  category?: string;
}

export interface CashOutData {
  walletId: string;
  amount: number;
  description: string;
  date: string;
  currency: string;
  category?: string;
}

export interface TransferData {
  fromAccountId: string;
  fromAccountType: 'bank' | 'cash';
  toAccountId: string;
  toAccountType: 'bank' | 'cash';
  amount: number;
  description: string;
  date: string;
  currency: string;
  category?: string;
}

export interface Settlement {
  _id: string;
  userId: string;
  fromPersonId: string | Person;
  toPersonId: string | Person;
  amount: number;
  currency: string;
  status: 'pending' | 'settled' | 'cancelled';
  settlementMethod?: 'bank' | 'cash' | 'other';
  settlementDate?: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingBalance {
  fromPersonId: string;
  fromPersonName: string;
  toPersonId: string;
  toPersonName: string;
  amount: number;
  currency: string;
}

export interface Group {
  _id: string;
  userId: string;
  name: string;
  type: 'trip' | 'fees' | 'event' | 'custom';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency: string;
  members: string[] | Person[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummary {
  group: Group;
  totalSpent: number;
  transactionCount: number;
  perPersonShare: Array<{
    personId: string;
    personName: string;
    share: number;
    paid: number;
    balance: number;
  }>;
  budgetVsActual?: {
    budget: number;
    actual: number;
    difference: number;
    percentage: number;
  };
}

export interface SplitDetails {
  parentTransaction: Transaction;
  childTransactions: Transaction[];
  splitBreakdown: Array<{
    personId: string;
    personName: string;
    amount: number;
    percentage?: number;
  }>;
}

export interface CreateSplitTransactionData {
  accountId: string;
  accountType: 'bank' | 'cash';
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  category?: string;
  notes?: string;
  attachments?: string[];
  date: string;
  splitType: 'equal' | 'percentage' | 'custom';
  personIds: string[];
  percentages?: number[];
  customAmounts?: number[];
  groupId?: string;
}

export interface CreateSettlementData {
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  currency: string;
  settlementMethod?: 'bank' | 'cash' | 'other';
  notes?: string;
  createTransaction?: boolean;
  accountId?: string;
  accountType?: 'bank' | 'cash';
}

export interface CreateGroupData {
  name: string;
  type: 'trip' | 'fees' | 'event' | 'custom';
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency: string;
  members: string[];
  notes?: string;
}

