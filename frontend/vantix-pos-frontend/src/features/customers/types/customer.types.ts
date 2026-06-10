// src/features/customers/types/customer.types.ts

export interface Customer {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  totalComprado: number;
  ultimaCompra: string | null;
  lineaCreditoMaxima: number;
  deudaActual: number;
  estado: boolean;
  fechaCreacion: string;
}

// Lo que enviamos al backend para crear/editar (quitamos los campos automáticos)
export type CustomerRequest = Omit<
  Customer, 
  'id' | 'totalComprado' | 'ultimaCompra' | 'deudaActual' | 'estado' | 'fechaCreacion'
>;