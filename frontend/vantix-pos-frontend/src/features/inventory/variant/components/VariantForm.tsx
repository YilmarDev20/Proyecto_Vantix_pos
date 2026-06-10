import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Variant, VariantRequest } from '../types/variant.types';
import { useAuth } from '@/core/auth/context/AuthContext'; 

// Importación de subsecciones desacopladas
import { VariantAttributesSection } from './form/VariantAttributesSection';
import { VariantBasePricesSection } from './form/VariantBasePricesSection';
import { VariantPresentationsSection } from './form/VariantPresentationsSection';
import { ImageUploader } from '@/components/ui/ImageUploader';

// ✅ BUENA PRÁCTICA: Agregamos la validación cruzada con .refine() al final del objeto
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
  presentacionesList: z.array(z.object({
    id: z.number().optional(), 
    nombre: z.string().min(1, "El nombre del empaque es obligatorio"),
    codigoBarras: z.string().optional().nullable(),
    factorConversion: z.coerce.number().min(0.0001, "El factor debe ser mayor a 0"), 
    precioVenta: z.coerce.number().min(0, "Debe tener un precio válido") 
  })).default([])
}).refine((data) => data.precioVenta >= data.precioCompra, {
  message: "El precio de venta no puede ser menor que el costo de compra.",
  path: ["precioVenta"], // Coloca el mensaje de error directamente en el input de precioVenta
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
        presentacionesList: initialData.presentaciones?.map(p => ({
          id: p.id, 
          nombre: p.nombre,
          codigoBarras: p.codigoBarras || '',
          factorConversion: p.factorConversion,
          precioVenta: p.precioVenta
        })) || []
      });
    } else {
      methods.reset({ 
        atributosList: [], codigoBarras: '', precioCompra: 0, precioVenta: 0, 
        precioMayorista: '', cantidadMayorista: '', precioOferta: '', 
        stockMinimo: 5, presentacionesList: [], imagenUrl: '' 
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
      presentaciones: data.presentacionesList.map((p: any) => ({
        id: p.id, 
        nombre: p.nombre,
        codigoBarras: p.codigoBarras ? p.codigoBarras.trim() : null,
        factorConversion: Number(p.factorConversion),
        precioVenta: Number(p.precioVenta)
      }))
    };

    onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-5">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* COLUMNA IZQUIERDA: Formulario Desacoplado */}
          <div className="lg:col-span-2 space-y-5">
            <VariantAttributesSection />
            <VariantBasePricesSection isAdmin={isAdmin} />
          </div>

          {/* COLUMNA DERECHA: Imagen Estática */}
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Imagen de Variante</h4>
              <ImageUploader 
                folder="variantes"
                initialUrl={methods.watch('imagenUrl')}
                onImageUploaded={(url) => methods.setValue('imagenUrl', url)}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN EXPANDIDA INFERIOR */}
        <VariantPresentationsSection />

        {/* CONTROLES GENERALES */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Variante'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};