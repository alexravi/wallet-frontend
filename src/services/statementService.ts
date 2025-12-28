import api from './api';
import {
  BankStatement,
  ParsedTransaction,
} from '../types/account.types';

export const statementService = {
  uploadStatement: async (
    file: File,
    bankAccountId: string
  ): Promise<BankStatement> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bankAccountId', bankAccountId);

    const response = await api.post('/api/statements/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  parseStatement: async (statementId: string): Promise<{
    statement: BankStatement;
    transactions: ParsedTransaction[];
    duplicateCount: number;
  }> => {
    const response = await api.post(`/api/statements/${statementId}/parse`);
    return response.data.data;
  },

  getParsedTransactions: async (statementId: string): Promise<{
    statement: BankStatement;
    transactions: ParsedTransaction[];
    duplicateCount: number;
  }> => {
    const response = await api.get(`/api/statements/${statementId}/transactions`);
    return response.data.data;
  },

  editParsedTransaction: async (
    statementId: string,
    transactionId: string,
    data: Partial<ParsedTransaction>
  ): Promise<ParsedTransaction> => {
    const response = await api.put(
      `/api/statements/${statementId}/transactions/${transactionId}`,
      data
    );
    return response.data.data;
  },

  confirmParsedTransactions: async (
    statementId: string,
    transactionIds?: string[],
    skipDuplicates: boolean = false
  ): Promise<{
    created: number;
    skipped: number;
    duplicates: number;
  }> => {
    const response = await api.post(`/api/statements/${statementId}/confirm`, {
      transactionIds,
      skipDuplicates,
    });
    return response.data.data;
  },
};

