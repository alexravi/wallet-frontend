import api from './api';
import {
  BankAccount,
  CashWallet,
  AccountListItem,
  CreateBankAccountData,
  UpdateBankAccountData,
  CreateCashWalletData,
  UpdateCashWalletData,
} from '../types/account.types';

export const accountService = {
  // Bank Accounts
  createBankAccount: async (data: CreateBankAccountData): Promise<BankAccount> => {
    const response = await api.post('/api/accounts/bank', data);
    return response.data.data;
  },

  getBankAccounts: async (includeArchived: boolean = false): Promise<BankAccount[]> => {
    const response = await api.get('/api/accounts/bank', {
      params: { includeArchived },
    });
    return response.data.data;
  },

  getBankAccountById: async (id: string): Promise<BankAccount> => {
    const response = await api.get(`/api/accounts/bank/${id}`);
    return response.data.data;
  },

  updateBankAccount: async (
    id: string,
    data: UpdateBankAccountData
  ): Promise<BankAccount> => {
    const response = await api.put(`/api/accounts/bank/${id}`, data);
    return response.data.data;
  },

  archiveBankAccount: async (id: string): Promise<void> => {
    await api.delete(`/api/accounts/bank/${id}`);
  },

  // Cash Wallets
  createCashWallet: async (data: CreateCashWalletData): Promise<CashWallet> => {
    const response = await api.post('/api/accounts/cash', data);
    return response.data.data;
  },

  getCashWallets: async (includeArchived: boolean = false): Promise<CashWallet[]> => {
    const response = await api.get('/api/accounts/cash', {
      params: { includeArchived },
    });
    return response.data.data;
  },

  getCashWalletById: async (id: string): Promise<CashWallet> => {
    const response = await api.get(`/api/accounts/cash/${id}`);
    return response.data.data;
  },

  updateCashWallet: async (
    id: string,
    data: UpdateCashWalletData
  ): Promise<CashWallet> => {
    const response = await api.put(`/api/accounts/cash/${id}`, data);
    return response.data.data;
  },

  archiveCashWallet: async (id: string): Promise<void> => {
    await api.delete(`/api/accounts/cash/${id}`);
  },

  // All Accounts
  getAllAccounts: async (includeArchived: boolean = false): Promise<AccountListItem[]> => {
    const response = await api.get('/api/accounts/all', {
      params: { includeArchived },
    });
    return response.data.data;
  },
};

