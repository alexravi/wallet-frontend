import api from './api';
import { Person } from '../types/account.types';

export interface CreatePersonData {
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
}

export interface UpdatePersonData {
  name?: string;
  type?: 'child' | 'friend' | 'employee' | 'family' | 'other';
  notes?: string;
  overallLimit?: number;
  limitPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  categoryLimits?: Array<{
    categoryId: string;
    amount: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }>;
}

export interface SpendingSummary {
  total: number;
  byCategory: Array<{
    categoryId: string;
    categoryName?: string;
    amount: number;
  }>;
  byPeriod: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface LimitStatus {
  overallLimit?: {
    limit: number;
    spent: number;
    remaining: number;
    period: string;
    isBreached: boolean;
    percentage: number;
  };
  categoryLimits: Array<{
    categoryId: string;
    categoryName?: string;
    limit: number;
    spent: number;
    remaining: number;
    period: string;
    isBreached: boolean;
    percentage: number;
  }>;
}

export const personService = {
  getPeople: async (includeInactive: boolean = false): Promise<Person[]> => {
    const response = await api.get('/api/people', {
      params: { includeInactive },
    });
    return response.data.data;
  },

  getPersonById: async (id: string): Promise<Person> => {
    const response = await api.get(`/api/people/${id}`);
    return response.data.data;
  },

  createPerson: async (data: CreatePersonData): Promise<Person> => {
    const response = await api.post('/api/people', data);
    return response.data.data;
  },

  updatePerson: async (id: string, data: UpdatePersonData): Promise<Person> => {
    const response = await api.put(`/api/people/${id}`, data);
    return response.data.data;
  },

  deletePerson: async (id: string): Promise<void> => {
    await api.delete(`/api/people/${id}`);
  },

  getPersonSpendingSummary: async (
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<SpendingSummary> => {
    const response = await api.get(`/api/people/${id}/spending`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  checkPersonLimits: async (
    id: string,
    amount: number,
    categoryId?: string
  ): Promise<LimitStatus> => {
    const response = await api.get(`/api/people/${id}/spending/limits`, {
      params: { amount, categoryId },
    });
    return response.data.data;
  },
};

