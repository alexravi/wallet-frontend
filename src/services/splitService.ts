import api from './api';
import { CreateSplitTransactionData, SplitDetails } from '../types/account.types';

export const splitService = {
  createSplitTransaction: async (data: CreateSplitTransactionData) => {
    const response = await api.post('/api/splits', data);
    return response.data.data as SplitDetails;
  },

  getSplitDetails: async (transactionId: string) => {
    const response = await api.get(`/api/splits/${transactionId}`);
    return response.data.data as SplitDetails;
  },

  updateSplitTransaction: async (transactionId: string, data: Partial<CreateSplitTransactionData>) => {
    const response = await api.put(`/api/splits/${transactionId}`, data);
    return response.data.data as SplitDetails;
  },

  removeSplit: async (transactionId: string) => {
    const response = await api.delete(`/api/splits/${transactionId}`);
    return response.data.data;
  },
};

