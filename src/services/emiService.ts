import api from './api';
import {
  EMISchedule,
  GenerateEMIScheduleData,
} from '../types/loan.types';

export const emiService = {
  generateEMISchedule: async (
    loanId: string,
    data: GenerateEMIScheduleData
  ): Promise<EMISchedule[]> => {
    const response = await api.post(`/api/emi/loans/${loanId}/schedule`, data);
    return response.data.data;
  },

  regenerateEMISchedule: async (
    loanId: string,
    data: GenerateEMIScheduleData
  ): Promise<EMISchedule[]> => {
    const response = await api.put(`/api/emi/loans/${loanId}/schedule`, data);
    return response.data.data;
  },

  getEMISchedule: async (loanId: string): Promise<EMISchedule[]> => {
    const response = await api.get(`/api/emi/loans/${loanId}/schedule`);
    return response.data.data;
  },

  markEMIPaid: async (
    emiScheduleId: string,
    paymentId: string,
    paidDate?: string
  ): Promise<EMISchedule> => {
    const response = await api.post(`/api/emi/${emiScheduleId}/mark-paid`, {
      paymentId,
      paidDate,
    });
    return response.data.data;
  },

  detectMissedEMIs: async (loanId?: string): Promise<EMISchedule[]> => {
    const response = await api.get('/api/emi/missed', {
      params: { loanId },
    });
    return response.data.data;
  },

  getMissedEMIs: async (loanId?: string): Promise<EMISchedule[]> => {
    const response = await api.get('/api/emi/missed/list', {
      params: { loanId },
    });
    return response.data.data;
  },

  handleEarlyClosure: async (
    loanId: string,
    closureDate?: string
  ): Promise<{
    skippedEMIs: EMISchedule[];
    finalSettlement: number;
  }> => {
    const response = await api.post(`/api/emi/loans/${loanId}/early-closure`, {
      closureDate,
    });
    return response.data.data;
  },

  getUpcomingEMIs: async (days: number = 30): Promise<EMISchedule[]> => {
    const response = await api.get('/api/emi/upcoming', {
      params: { days },
    });
    return response.data.data;
  },
};

