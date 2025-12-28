import api from './api';
import { Category } from '../types/account.types';

export interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
  keywords?: string[];
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  keywords?: string[];
}

export interface MergeCategoriesData {
  targetCategoryId: string;
}

export const categoryService = {
  getCategories: async (includeArchived: boolean = false): Promise<Category[]> => {
    const response = await api.get('/api/categories', {
      params: { includeArchived },
    });
    return response.data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post('/api/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data.data;
  },

  archiveCategory: async (id: string): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },

  mergeCategories: async (sourceCategoryId: string, data: MergeCategoriesData): Promise<{ merged: boolean; transactionCount: number }> => {
    const response = await api.post(`/api/categories/${sourceCategoryId}/merge`, data);
    return response.data.data;
  },
};

