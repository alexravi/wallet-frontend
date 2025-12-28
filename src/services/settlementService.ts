import api from './api';
import { CreateSettlementData, Settlement, PendingBalance } from '../types/account.types';

export const settlementService = {
  getPendingBalances: async () => {
    const response = await api.get('/api/settlements/pending');
    return response.data.data as PendingBalance[];
  },

  createSettlement: async (data: CreateSettlementData) => {
    const response = await api.post('/api/settlements', data);
    return response.data.data as Settlement;
  },

  settleBalance: async (settlementId: string, settlementDate?: string) => {
    const response = await api.put(`/api/settlements/${settlementId}/settle`, {
      settlementDate,
    });
    return response.data.data as Settlement;
  },

  getSettlementHistory: async (limit: number = 50, skip: number = 0) => {
    const response = await api.get('/api/settlements/history', {
      params: { limit, skip },
    });
    return {
      settlements: response.data.data as Settlement[],
      total: response.data.total as number,
    };
  },

  getPendingSettlements: async () => {
    const response = await api.get('/api/settlements/pending-list');
    return response.data.data as Settlement[];
  },

  getSettlementById: async (settlementId: string) => {
    const response = await api.get(`/api/settlements/${settlementId}`);
    return response.data.data as Settlement;
  },
};

