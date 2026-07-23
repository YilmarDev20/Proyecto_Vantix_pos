import { useFormContext } from 'react-hook-form';
import { Globe, Tag, ShoppingBag } from 'lucide-react';

export const VariantEcommerceSection = () => {
  const { register, watch, formState: {  } } = useFormContext();
  const publicadoEnWeb = watch('publicadoEnWeb');

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h4 className="text-sm font-bold text-slate-800 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-indigo-600" /> Opciones E-Commerce de Variante
        </h4>

        {/* Switch de Visibilidad Individual */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            {...register('publicadoEnWeb')} 
            className="sr-only peer" 
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ml-2 text-xs font-bold text-slate-700">
            {publicadoEnWeb ? 'Publicado' : 'Oculto'}
          </span>
        </label>
      </div>

      {publicadoEnWeb ? (
        <div className="space-y-3 pt-1">
          {/* Precio de Oferta Web */}
          <div>
            <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
              <Tag className="w-3.5 h-3.5 mr-1 text-rose-500" /> Precio Oferta Web (S/)
            </label>
            <input 
              type="number" 
              step="0.01" 
              {...register('precioOferta')} 
              placeholder="Opcional. Ej: 8.50" 
              className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-rose-600 bg-white" 
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Si se completa, en la web figurará como precio rebajado.</p>
          </div>

          {/* Precio Mayorista Web */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                <ShoppingBag className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Cant. Mínima Mayorista
              </label>
              <input 
                type="number" 
                {...register('cantidadMayorista')} 
                placeholder="Ej: 6" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold bg-white" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio Mayorista (S/)
              </label>
              <input 
                type="number" 
                step="0.01" 
                {...register('precioMayorista')} 
                placeholder="Ej: 7.00" 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-600 bg-white" 
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          Esta variante está desactivada de la web. Solo se podrá vender en el Punto de Venta físico.
        </p>
      )}
    </div>
  );
};