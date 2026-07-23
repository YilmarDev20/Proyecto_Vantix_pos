import { useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, XCircle, PackagePlus, Trash2 } from 'lucide-react';
import type { Product, ProductRequest } from '../types/product.types';

import { BasicInfoSection } from './form/BasicInfoSection';
import { ClassificationSection } from './form/ClassificationSection';
import { EcommerceSection } from './form/EcommerceSection';
import { ImageUploader } from '@/components/ui/ImageUploader';

const productSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 letras"),
  marca: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
  unidadMedida: z.enum(['NIU', 'KGM', 'LTR', 'MTR', 'BX']),
  categoriaId: z.coerce.number().nullable().optional(), 
  etiquetas: z.array(z.string()).default([]),
  imagenUrl: z.string().optional().nullable(),
  publicadoEnWeb: z.boolean().default(true), // 🚀 NUEVO EN EL SCHEMA
  packsSurtidos: z.object({
    id: z.number().optional(),
    nombre: z.string().min(2, "El nombre es obligatorio"),
    cantidadRequerida: z.coerce.number().min(2, "Debe agrupar al menos 2 unidades"),
    precioPack: z.coerce.number().min(0.1, "El precio debe ser mayor a 0"),
  }).array().default([])
});

interface ProductFormProps {
  initialData?: Product | null; 
  categories: any[];
  onSubmit: (data: ProductRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PacksSurtidosSection = () => {
  const { control, register, formState: { errors } } = useFormContext<any>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packsSurtidos"
  });

  const packErrors = errors?.packsSurtidos as any[] | undefined;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <PackagePlus className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Packs Surtidos (Mix & Match)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Agrupa variantes para aplicar precios por volumen.</p>
        </div>
        <button 
          type="button" 
          onClick={() => append({ nombre: 'Docena Surtida', cantidadRequerida: 12, precioPack: 10 })}
          className="flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold text-sm rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
        >
          <PackagePlus className="w-4 h-4 mr-1.5" /> Añadir Pack
        </button>
      </div>

      <div className="space-y-4">
        {fields.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">No hay packs surtidos configurados. Haz clic en "Añadir Pack".</p>
          </div>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 items-start transition-colors">
            <div className="col-span-12 md:col-span-5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Nombre del Pack</label>
              <input 
                {...register(`packsSurtidos.${index}.nombre`)} 
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
              />
              {packErrors?.[index]?.nombre?.message && (
                <span className="text-xs text-red-500 font-bold">{packErrors[index].nombre.message}</span>
              )}
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Cant. Requerida</label>
              <input 
                type="number"
                {...register(`packsSurtidos.${index}.cantidadRequerida`)} 
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-center font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white" 
              />
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Precio Total (S/)</label>
              <input 
                type="number" step="0.10"
                {...register(`packsSurtidos.${index}.precioPack`)} 
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-indigo-500 outline-none bg-white dark:bg-slate-900" 
              />
            </div>

            <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center md:pt-6">
              <button 
                type="button" 
                onClick={() => remove(index)} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductForm = ({ initialData, categories, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  
  const methods = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '', 
      marca: '', 
      descripcion: '', 
      unidadMedida: 'NIU', 
      categoriaId: "", 
      etiquetas: [], 
      imagenUrl: '',
      publicadoEnWeb: true, // 🚀 NUEVO DEFAULT
      packsSurtidos: []
    }
  });

  useEffect(() => {
    if (initialData) {
      methods.reset({
        nombre: initialData.nombre,
        marca: initialData.marca || '',
        descripcion: initialData.descripcion || '',
        unidadMedida: initialData.unidadMedida,
        categoriaId: initialData.categoriaId || "",
        etiquetas: initialData.etiquetas || [],
        imagenUrl: initialData.imagenUrl || '',
        publicadoEnWeb: initialData.publicadoEnWeb ?? true, // 🚀 RECUPERA EL VALOR EXISTENTE
        packsSurtidos: initialData.packsSurtidos || []
      });
    }
  }, [initialData, methods]);

  const handleFormSubmit = (data: any) => {
    const payload: ProductRequest = {
      ...data,
      categoriaId: !data.categoriaId ? null : Number(data.categoriaId)
    };
    onSubmit(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoSection />
            <PacksSurtidosSection />
          </div>
          
          <div className="space-y-6">
            <ClassificationSection categories={categories} />
            
            {/* 🚀 NUEVA SECCIÓN MODULAR DE E-COMMERCE */}
            <EcommerceSection />

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Imagen del Producto</h3>
              <ImageUploader 
                folder="productos" 
                initialUrl={methods.watch('imagenUrl')} 
                onImageUploaded={(url) => methods.setValue('imagenUrl', url)} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <button type="button" onClick={onCancel} className="flex items-center px-6 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
            <XCircle className="w-5 h-5 mr-2" /> Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="flex items-center px-6 py-2 bg-primary dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm">
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};