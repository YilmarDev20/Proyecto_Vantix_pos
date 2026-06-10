import { api } from '@/config/api';
import type { Category, CategoryRequest } from '../types/category.types';

const CATEGORY_URL = '/categorias';

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get(CATEGORY_URL);
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await api.get(`${CATEGORY_URL}/${id}`);
    return data;
  },

  create: async (category: CategoryRequest): Promise<Category> => {
    const { data } = await api.post(CATEGORY_URL, category);
    return data;
  },

  update: async (id: number, category: CategoryRequest): Promise<Category> => {
    const { data } = await api.put(`${CATEGORY_URL}/${id}`, category);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${CATEGORY_URL}/${id}`);
  },

  toggleStatus: async (id: number): Promise<Category> => {
    const { data } = await api.patch(`${CATEGORY_URL}/${id}/estado`);
    return data;
  }
};