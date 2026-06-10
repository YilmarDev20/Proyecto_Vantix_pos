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