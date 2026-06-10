// src/features/customers/services/customer.api.ts
import { api } from '@/config/api';
import type { Customer, CustomerRequest } from '../types/customer.types';

const BASE_URL = '/clientes';

export const CustomerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await api.get(BASE_URL);
    return data;
  },

  getById: async (id: number): Promise<Customer> => {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return data;
  },

  create: async (customer: CustomerRequest): Promise<Customer> => {
    const { data } = await api.post(BASE_URL, customer);
    return data;
  },

  update: async (id: number, customer: CustomerRequest): Promise<Customer> => {
    const { data } = await api.put(`${BASE_URL}/${id}`, customer);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  toggleStatus: async (id: number): Promise<Customer> => {
    const { data } = await api.patch(`${BASE_URL}/${id}/estado`);
    return data;
  }
};