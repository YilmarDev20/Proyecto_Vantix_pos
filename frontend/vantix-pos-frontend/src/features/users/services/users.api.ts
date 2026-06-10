import { api } from '@/config/api';
import type { AppUser, AppUserRequest } from '../types/users.types';

const USER_URL = '/usuarios';

export const UserService = {
  getAll: async (): Promise<AppUser[]> => {
    const { data } = await api.get(USER_URL);
    return data;
  },

  create: async (user: AppUserRequest): Promise<AppUser> => {
    const { data } = await api.post(USER_URL, user);
    return data;
  },

  update: async (id: number, user: AppUserRequest): Promise<AppUser> => {
    const { data } = await api.put(`${USER_URL}/${id}`, user);
    return data;
  },

  toggleStatus: async (id: number): Promise<AppUser> => {
    const { data } = await api.patch(`${USER_URL}/${id}/estado`);
    return data;
  }
};