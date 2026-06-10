import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Save, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { CompanySettingsService } from '@/features/company/services/company.api';
import type { CompanySettingsRequest } from '@/features/company/types/company.types';

const companySchema = z.object({
  razonSocial: z.string().min(3, "La razón social es muy corta"),
  rucNit: z.string().min(8, "RUC/NIT inválido"),
  direccionFiscal: z.string().optional(),
  moneda: z.string().min(1, "Campo requerido"),
  simboloMoneda: z.string().min(1, "Campo requerido"),
  impuestoNombre: z.string().min(1, "Campo requerido"),
  impuestoPorcentaje: z.coerce.number().min(0, "No puede ser negativo"),
  logoUrl: z.string().optional().nullable()
});

export const CompanySettingsTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<any>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await CompanySettingsService.getSettings();
        
        setCurrentLogo(data.logoUrl); 

        reset({
          razonSocial: data.razonSocial,
          rucNit: data.rucNit,
          direccionFiscal: data.direccionFiscal || '',
          moneda: data.moneda,
          simboloMoneda: data.simboloMoneda,
          impuestoNombre: data.impuestoNombre,
          impuestoPorcentaje: data.impuestoPorcentaje,
          logoUrl: data.logoUrl || ''
        });
      } catch (error) {
        toast.error('Error al cargar la configuración global');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      await CompanySettingsService.updateSettings(data as CompanySettingsRequest);
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido (PNG, JPG).');
      return;
    }

    try {
      setIsUploading(true);
      toast.loading('Subiendo logo...', { id: 'upload' });
      
      const updatedConfig = await CompanySettingsService.uploadLogo(file);
      
      setCurrentLogo(updatedConfig.logoUrl);
      setValue('logoUrl', updatedConfig.logoUrl);
      
      toast.success('¡Logo actualizado con éxito!', { id: 'upload' });
    } catch (error) {
      toast.error('Error al subir la imagen. Verifica tu conexión.', { id: 'upload' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium italic">Cargando configuración global...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
      
      {/* PANEL IZQUIERDO: LOGO DE LA EMPRESA */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center h-full transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Logotipo Oficial</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Aparecerá en el menú lateral y en la cabecera de tus tickets.</p>

          <div className="w-full flex justify-center mb-6">
            {currentLogo ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950 w-48 h-48 flex items-center justify-center transition-colors">
                <img 
                  src={currentLogo} 
                  alt="Logo Empresa" 
                  className="max-w-full max-h-full object-contain p-4 shadow-sm bg-white dark:bg-transparent rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg hover:bg-slate-50 transform hover:scale-105 transition-all">
                    <UploadCloud className="w-4 h-4 mr-2" /> Cambiar Logo
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-48 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:border-primary dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform border border-transparent dark:border-slate-800">
                  <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-blue-400">Subir Logo</span>
                <span className="text-[10px] mt-1 font-medium text-slate-400 dark:text-slate-500">PNG o JPG (Máx 2MB)</span>
              </div>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/png, image/jpeg" 
            className="hidden" 
          />
        </div>
      </div>

      {/* PANEL DERECHO: FORMULARIO GLOBAL */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors">Datos Fiscales y Formatos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Esta información aparecerá impresa en todos los tickets y facturas.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Razón Social *</label>
              <input type="text" {...register('razonSocial')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm" />
              {errors.razonSocial && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.razonSocial.message)}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RUC / NIT *</label>
              <input type="text" {...register('rucNit')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm" />
              {errors.rucNit && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.rucNit.message)}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección Fiscal Principal</label>
            <input type="text" {...register('direccionFiscal')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mt-4 transition-colors">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
              <input type="text" {...register('moneda')} placeholder="Ej: Soles" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm" />
              {errors.moneda && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.moneda.message)}</p>}
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Símbolo</label>
              <input type="text" {...register('simboloMoneda')} placeholder="Ej: S/" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-center transition-colors text-sm" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Impuesto</label>
              <input type="text" {...register('impuestoNombre')} placeholder="Ej: IGV" className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 uppercase transition-colors text-sm" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">% Valor</label>
              <input type="number" step="0.01" {...register('impuestoPorcentaje')} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-center transition-colors text-sm" />
              {errors.impuestoPorcentaje && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.impuestoPorcentaje.message)}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <button type="submit" disabled={isSaving || isUploading} className="flex items-center px-6 py-2.5 bg-primary dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors text-sm border border-transparent shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};