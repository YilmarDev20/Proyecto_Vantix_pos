import { api } from '@/config/api';
import type { Store, StoreRequest } from '../types/stores.types';

const STORE_URL = '/tiendas';

export const StoreService = {
  getAll: async (): Promise<Store[]> => {
    const { data } = await api.get(STORE_URL);
    return data;
  },

  getById: async (id: number): Promise<Store> => {
    const { data } = await api.get(`${STORE_URL}/${id}`);
    return data;
  },

  create: async (store: StoreRequest): Promise<Store> => {
    const { data } = await api.post(STORE_URL, store);
    return data;
  },

  update: async (id: number, store: StoreRequest): Promise<Store> => {
    const { data } = await api.put(`${STORE_URL}/${id}`, store);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${STORE_URL}/${id}`);
  },

  toggleStatus: async (id: number): Promise<Store> => {
    const { data } = await api.patch(`${STORE_URL}/${id}/estado`);
    return data;
  }
};