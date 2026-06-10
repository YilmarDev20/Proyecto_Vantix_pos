import { api } from '@/config/api';
import type { CompanySettings, CompanySettingsRequest } from '../types/company.types';

const CONFIG_URL = '/configuracion';

export const CompanySettingsService = {
  getSettings: async (): Promise<CompanySettings> => {
    const { data } = await api.get(CONFIG_URL);
    return data;
  },

  updateSettings: async (settings: CompanySettingsRequest): Promise<CompanySettings> => {
    const { data } = await api.put(CONFIG_URL, settings);
    return data;
  },

  // ---> NUEVO MÉTODO PARA IMÁGENES <---
  uploadLogo: async (file: File): Promise<CompanySettings> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Al mandar FormData, Axios ajusta automáticamente el header a multipart/form-data
    const { data } = await api.post(`${CONFIG_URL}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};