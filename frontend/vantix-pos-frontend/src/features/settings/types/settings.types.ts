// src/features/settings/types/settings.types.ts

// ==========================================
// 1. TIPOS PARA CONFIGURACIÓN DE EMPRESA
// ==========================================
export interface CompanySettings {
  id: number;
  razonSocial: string;
  rucNit: string;
  direccionFiscal: string;
  moneda: string;
  simboloMoneda: string;
  impuestoNombre: string;
  impuestoPorcentaje: number;
  logoUrl: string | null;
  fechaActualizacion: string;
}

export type CompanySettingsRequest = Omit<CompanySettings, 'id' | 'fechaActualizacion'>;

// ==========================================
// 2. TIPOS PARA SUCURSALES (TIENDAS)
// ==========================================
export interface Store {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  mensajeTicket: string;
  estado: boolean;
  fechaCreacion: string;
}

export type StoreRequest = Omit<Store, 'id' | 'estado' | 'fechaCreacion'>;

// (Mantén tus tipos actuales de CompanySettings y Store arriba...)

// ==========================================
// 3. TIPOS PARA USUARIOS Y ROLES
// ==========================================
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
  password?: string; // Opcional al editar
  rol: 'ROLE_ADMIN' | 'ROLE_SELLER';
  tiendaId: number;
}