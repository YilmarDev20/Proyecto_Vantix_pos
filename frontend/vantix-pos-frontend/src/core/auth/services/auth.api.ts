import { api } from '@/config/api';
import type { AuthResponse, LoginCredentials } from '../types/auth.types';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  }
};