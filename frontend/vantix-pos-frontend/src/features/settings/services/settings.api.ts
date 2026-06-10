// src/features/settings/services/settings.api.ts
import { api } from '@/config/api';
import type { CompanySettings, CompanySettingsRequest, Store, StoreRequest } from '../types/settings.types';

// ==========================================
// 1. SERVICIO DE CONFIGURACIÓN DE EMPRESA
// ==========================================
const CONFIG_URL = '/configuracion';

export const CompanySettingsService = {
  getSettings: async (): Promise<CompanySettings> => {
    const { data } = await api.get(CONFIG_URL);
    return data;
  },

  updateSettings: async (settings: CompanySettingsRequest): Promise<CompanySettings> => {
    const { data } = await api.put(CONFIG_URL, settings);
    return data;
  }
};

// ==========================================
// 2. SERVICIO DE SUCURSALES (TIENDAS)
// ==========================================
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

// ==========================================
// 3. SERVICIO DE USUARIOS
// ==========================================
const USER_URL = '/usuarios';

export const UserService = {
  getAll: async (): Promise<any[]> => {
    const { data } = await api.get(USER_URL);
    return data;
  },

  create: async (user: any): Promise<any> => {
    const { data } = await api.post(USER_URL, user);
    return data;
  },

  update: async (id: number, user: any): Promise<any> => {
    const { data } = await api.put(`${USER_URL}/${id}`, user);
    return data;
  },

  toggleStatus: async (id: number): Promise<any> => {
    const { data } = await api.patch(`${USER_URL}/${id}/estado`);
    return data;
  }
};