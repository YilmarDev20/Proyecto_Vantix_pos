export interface AuditoriaLog {
  id: number;
  usuarioId: number;
  tiendaId: number;
  modulo: string;
  accion: string;
  entidadId: number | null;
  descripcion: string;
  valoresAnteriores: string | null; // Llega como JSON String desde el Backend
  valoresNuevos: string | null;     // Llega como JSON String desde el Backend
  direccionIp: string;
  fechaRegistro: string;
}