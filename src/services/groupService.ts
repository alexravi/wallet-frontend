import api from './api';
import { CreateGroupData, Group, GroupSummary, Transaction } from '../types/account.types';

export const groupService = {
  createGroup: async (data: CreateGroupData) => {
    const response = await api.post('/api/groups', data);
    return response.data.data as Group;
  },

  getGroups: async (includeInactive: boolean = false) => {
    const response = await api.get('/api/groups', {
      params: { includeInactive },
    });
    return response.data.data as Group[];
  },

  getGroupById: async (groupId: string) => {
    const response = await api.get(`/api/groups/${groupId}`);
    return response.data.data as Group;
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupData & { isActive?: boolean }>) => {
    const response = await api.put(`/api/groups/${groupId}`, data);
    return response.data.data as Group;
  },

  deleteGroup: async (groupId: string) => {
    await api.delete(`/api/groups/${groupId}`);
  },

  addGroupMember: async (groupId: string, personId: string) => {
    const response = await api.post(`/api/groups/${groupId}/members`, { personId });
    return response.data.data as Group;
  },

  removeGroupMember: async (groupId: string, personId: string) => {
    const response = await api.delete(`/api/groups/${groupId}/members/${personId}`);
    return response.data.data as Group;
  },

  getGroupSummary: async (groupId: string) => {
    const response = await api.get(`/api/groups/${groupId}/summary`);
    return response.data.data as GroupSummary;
  },

  getGroupTransactions: async (groupId: string) => {
    const response = await api.get(`/api/groups/${groupId}/transactions`);
    return response.data.data as Transaction[];
  },
};

