import api from './api';
import {
  SavingsGoal,
  SavingsContribution,
  CreateSavingsGoalData,
  AddContributionData,
  DeviationAlert,
} from '../types/savings.types';

export const savingsService = {
  createSavingsGoal: async (data: CreateSavingsGoalData): Promise<SavingsGoal> => {
    const response = await api.post('/api/savings/goals', data);
    return response.data.data;
  },

  getSavingsGoals: async (filters?: {
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<SavingsGoal[]> => {
    const response = await api.get('/api/savings/goals', {
      params: filters,
    });
    return response.data.data;
  },

  getSavingsGoalById: async (id: string): Promise<SavingsGoal> => {
    const response = await api.get(`/api/savings/goals/${id}`);
    return response.data.data;
  },

  addContribution: async (
    goalId: string,
    data: AddContributionData
  ): Promise<{
    contribution: SavingsContribution;
    goal: SavingsGoal;
    transaction?: any;
  }> => {
    const response = await api.post(`/api/savings/goals/${goalId}/contributions`, data);
    return response.data.data;
  },

  getContributions: async (goalId: string): Promise<SavingsContribution[]> => {
    const response = await api.get(`/api/savings/goals/${goalId}/contributions`);
    return response.data.data;
  },

  pauseGoal: async (goalId: string): Promise<SavingsGoal> => {
    const response = await api.patch(`/api/savings/goals/${goalId}/pause`);
    return response.data.data;
  },

  resumeGoal: async (goalId: string): Promise<SavingsGoal> => {
    const response = await api.patch(`/api/savings/goals/${goalId}/resume`);
    return response.data.data;
  },

  getDeviationAlerts: async (goalId: string): Promise<DeviationAlert> => {
    const response = await api.get(`/api/savings/goals/${goalId}/alerts`);
    return response.data.data;
  },

  cancelGoal: async (goalId: string): Promise<SavingsGoal> => {
    const response = await api.delete(`/api/savings/goals/${goalId}`);
    return response.data.data;
  },
};

