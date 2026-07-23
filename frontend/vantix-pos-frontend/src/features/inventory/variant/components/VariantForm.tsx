import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Variant, VariantRequest } from '../types/variant.types';
import { useAuth } from '@/core/auth/context/AuthContext'; 

import { VariantAttributesSection } from './form/VariantAttributesSection';
import { VariantBasePricesSection } from './form/VariantBasePricesSection';
import { VariantPresentationsSection } from './form/VariantPresentationsSection';
import { VariantEcommerceSection } from './form/VariantEcommerceSection';
import { ImageUploader } from '@/components/ui/ImageUploader';

const variantSchema = z.object({
  atributosList: z.array(z.object({
    clave: z.string().min(1, "Obligatorio"),
    valor: z.string().min(1, "Obligatorio")
  })).default([]),
  codigoBarras: z.string().optional().nullable(),
  precioCompra: z.coerce.number().min(0, "Mínimo 0"),
  precioVenta: z.coerce.number().min(0, "Mínimo 0"),
  precioMayorista: z.coerce.number().optional().nullable(),
  cantidadMayorista: z.coerce.number().optional().nullable(),
  precioOferta: z.coerce.number().optional().nullable(),
  stockMinimo: z.coerce.number().min(0, "Mínimo 0"), 
  imagenUrl: z.string().optional().nullable(),
  publicadoEnWeb: z.boolean().default(true),
  presentacionesList: z.array(z.object({
    id: z.number().optional(), 
    nombre: z.string().min(1, "El nombre del empaque es obligatorio"),
    codigoBarras: z.string().optional().nullable(),
    factorConversion: z.coerce.number().min(0.0001, "El factor debe ser mayor a 0"), 
    precioVenta: z.coerce.number().min(0, "Debe tener un precio válido"),
    publicadoEnWeb: z.boolean().default(true) // 🚀 NUEVO EN SCHEMA ZOD
  })).default([])
}).refine((data) => data.precioVenta >= data.precioCompra, {
  message: "El precio de venta no puede ser menor que el costo de compra.",
  path: ["precioVenta"],
});

interface VariantFormProps {
  productoId: number;
  initialData?: Variant | null;
  onSubmit: (data: VariantRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const VariantForm = ({ productoId, initialData, onSubmit, onCancel, isLoading }: VariantFormProps) => {
  const { user } = useAuth(); 
  const isAdmin = user?.rol === 'ROLE_ADMIN'; 

  const methods = useForm<any>({
    resolver: zodResolver(variantSchema),
  });

  useEffect(() => {
    if (initialData) {
      const defaultAttributes = initialData.atributos 
        ? Object.entries(initialData.atributos).map(([clave, valor]) => ({ clave, valor: String(valor) }))
        : [];

      methods.reset({
        atributosList: defaultAttributes,
        codigoBarras: initialData.codigoBarras || '',
        precioCompra: initialData.precioCompra,
        precioVenta: initialData.precioVenta,
        precioMayorista: initialData.precioMayorista || '',
        cantidadMayorista: initialData.cantidadMayorista || '',
        precioOferta: initialData.precioOferta || '',
        stockMinimo: initialData.stockMinimo || 0, 
        imagenUrl: initialData.imagenUrl || '',
        publicadoEnWeb: initialData.publicadoEnWeb ?? true,
        presentacionesList: initialData.presentaciones?.map((p: any) => ({
          id: p.id, 
          nombre: p.nombre,
          codigoBarras: p.codigoBarras || '',
          factorConversion: p.factorConversion,
          precioVenta: p.precioVenta,
          publicadoEnWeb: p.publicadoEnWeb ?? true // 🚀 NUEVO EN MAPEADO INICIAL
        })) || []
      });
    } else {
      methods.reset({ 
        atributosList: [], codigoBarras: '', precioCompra: 0, precioVenta: 0, 
        precioMayorista: '', cantidadMayorista: '', precioOferta: '', 
        stockMinimo: 5, publicadoEnWeb: true, presentacionesList: [], imagenUrl: '' 
      });
    }
  }, [initialData, methods]);

  const handleFormSubmit = (data: any) => {
    const atributosLimpios: Record<string, string> = {};
    data.atributosList.forEach((item: { clave: string, valor: string }) => {
      if (item.clave.trim() && item.valor.trim()) {
        atributosLimpios[item.clave.trim()] = item.valor.trim();
      }
    });

    const payload: VariantRequest = {
      productoId,
      sku: initialData?.sku, 
      codigoBarras: data.codigoBarras ? data.codigoBarras.trim() : null,
      atributos: Object.keys(atributosLimpios).length > 0 ? atributosLimpios : null,
      precioCompra: Number(data.precioCompra),
      precioVenta: Number(data.precioVenta),
      precioMayorista: data.precioMayorista ? Number(data.precioMayorista) : null,
      cantidadMayorista: data.cantidadMayorista ? Number(data.cantidadMayorista) : null,
      precioOferta: data.precioOferta ? Number(data.precioOferta) : null,
      stockMinimo: Number(data.stockMinimo),
      imagenUrl: data.imagenUrl ? data.imagenUrl.trim() : null,
      publicadoEnWeb: Boolean(data.publicadoEnWeb),
      presentaciones: data.presentacionesList.map((p: any) => ({
        id: p.id, 
        nombre: p.nombre,
        codigoBarras: p.codigoBarras ? p.codigoBarras.trim() : null,
        factorConversion: Number(p.factorConversion),
        precioVenta: Number(p.precioVenta),
        publicadoEnWeb: Boolean(p.publicadoEnWeb) // 🚀 NUEVO EN ENVIAR PAYLOAD
      }))
    };

    onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* GRID PRINCIPAL: 2 Columnas amplias en Laptop/PC (lg:grid-cols-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA IZQUIERDA (7 de 12 columnas) */}
          <div className="lg:col-span-7 space-y-5">
            <VariantAttributesSection />
            <VariantBasePricesSection isAdmin={isAdmin} />
          </div>

          {/* COLUMNA DERECHA (5 de 12 columnas) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                Imagen de Variante
              </h4>
              <ImageUploader 
                folder="variantes"
                initialUrl={methods.watch('imagenUrl')}
                onImageUploaded={(url) => methods.setValue('imagenUrl', url)}
              />
            </div>

            {/* Opciones E-Commerce a la derecha junto a la imagen */}
            <VariantEcommerceSection />
          </div>
        </div>

        {/* SECCIÓN INFERIOR: Empaques a ancho completo */}
        <VariantPresentationsSection />

        {/* CONTROLES GENERALES */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-5 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar Variante' : 'Crear Variante'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};