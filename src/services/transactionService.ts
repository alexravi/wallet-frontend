import api from './api';
import {
  Transaction,
  CreateTransactionData,
  ParsedTransaction,
} from '../types/account.types';

export interface TransactionFilters {
  accountId?: string;
  accountType?: 'bank' | 'cash';
  type?: 'income' | 'expense' | 'transfer';
  category?: string;
  personId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  includeDeleted?: boolean;
  limit?: number;
  skip?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total: number;
}

export const transactionService = {
  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await api.post('/api/transactions', data);
    return response.data.data;
  },

  getTransactions: async (filters: TransactionFilters = {}): Promise<TransactionResponse> => {
    const response = await api.get('/api/transactions', { params: filters });
    return {
      transactions: response.data.data,
      total: response.data.total,
    };
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data.data;
  },

  updateTransaction: async (
    id: string,
    data: Partial<CreateTransactionData>
  ): Promise<Transaction> => {
    const response = await api.put(`/api/transactions/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },

  restoreTransaction: async (id: string): Promise<void> => {
    await api.post(`/api/transactions/${id}/restore`);
  },

  getDailyTransactions: async (date: string, includeDeleted: boolean = false): Promise<Transaction[]> => {
    const response = await api.get('/api/transactions/daily', {
      params: { date, includeDeleted },
    });
    return response.data.data;
  },

  checkDuplicates: async (
    transactions: Array<{
      date: string;
      amount: number;
      description: string;
      accountId: string;
    }>
  ): Promise<ParsedTransaction[]> => {
    const response = await api.post('/api/transactions/check-duplicates', {
      transactions,
    });
    return response.data.data;
  },
};

