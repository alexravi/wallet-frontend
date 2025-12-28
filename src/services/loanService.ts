import api from './api';
import {
  Loan,
  LoanPayment,
  CreateLoanData,
  RecordPaymentData,
} from '../types/loan.types';

export const loanService = {
  createLoan: async (data: CreateLoanData): Promise<Loan> => {
    const response = await api.post('/api/loans', data);
    return response.data.data;
  },

  getLoans: async (filters?: {
    loanType?: 'borrowed' | 'given' | 'hand';
    loanCategory?: 'bank' | 'cash';
    status?: 'active' | 'closed' | 'written-off';
    linkedPersonId?: string;
  }): Promise<Loan[]> => {
    const response = await api.get('/api/loans', {
      params: filters,
    });
    return response.data.data;
  },

  getLoanById: async (id: string): Promise<Loan> => {
    const response = await api.get(`/api/loans/${id}`);
    return response.data.data;
  },

  recordPayment: async (loanId: string, data: RecordPaymentData): Promise<{
    payment: LoanPayment;
    loan: Loan;
    transaction?: any;
  }> => {
    const response = await api.post(`/api/loans/${loanId}/payments`, data);
    return response.data.data;
  },

  closeLoan: async (loanId: string, writeOff: boolean = false): Promise<Loan> => {
    const response = await api.patch(`/api/loans/${loanId}/close`, { writeOff });
    return response.data.data;
  },

  updateLoan: async (loanId: string, data: {
    notes?: string;
    endDate?: string;
  }): Promise<Loan> => {
    const response = await api.put(`/api/loans/${loanId}`, data);
    return response.data.data;
  },
};

