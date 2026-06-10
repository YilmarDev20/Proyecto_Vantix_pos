export interface AppUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_SELLER';
  tiendaId: number;
  tiendaNombre: string;
  estado: boolean;
  fechaCreacion: string;
}

export interface AppUserRequest {
  nombre: string;
  email: string;
  password?: string;
  rol: 'ROLE_ADMIN' | 'ROLE_SELLER';
  tiendaId: number;
}