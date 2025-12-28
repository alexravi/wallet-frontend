import api from './api';
import {
  CashInData,
  CashOutData,
  TransferData,
  ReconciliationData,
  Transaction,
  CashWallet,
  BankAccount,
} from '../types/account.types';

export const cashOperationService = {
  cashIn: async (data: CashInData): Promise<{
    transaction: Transaction;
    wallet: CashWallet;
  }> => {
    const response = await api.post('/api/cash/in', data);
    return response.data.data;
  },

  cashOut: async (data: CashOutData): Promise<{
    transaction: Transaction;
    wallet: CashWallet;
  }> => {
    const response = await api.post('/api/cash/out', data);
    return response.data.data;
  },

  transfer: async (data: TransferData): Promise<{
    fromTransaction: Transaction;
    toTransaction: Transaction;
    fromAccount: BankAccount | CashWallet;
    toAccount: BankAccount | CashWallet;
  }> => {
    const response = await api.post('/api/cash/transfer', data);
    return response.data.data;
  },

  getReconciliation: async (
    walletId: string,
    month?: number,
    year?: number
  ): Promise<ReconciliationData> => {
    const response = await api.get(`/api/cash/reconciliation/${walletId}`, {
      params: { month, year },
    });
    return response.data.data;
  },

  completeReconciliation: async (walletId: string): Promise<void> => {
    await api.post(`/api/cash/reconciliation/${walletId}`);
  },
};

