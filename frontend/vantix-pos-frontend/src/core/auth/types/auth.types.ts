export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_SELLER';
  tiendaId: number | null;
  tiendaNombre: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}