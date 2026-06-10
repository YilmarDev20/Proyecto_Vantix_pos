export interface Store {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  mensajeTicket: string;
  esPrincipal: boolean; // ---> NUEVO CAMPO AÑADIDO <---
  estado: boolean;
  fechaCreacion: string;
}

export type StoreRequest = Omit<Store, 'id' | 'estado' | 'fechaCreacion'>;