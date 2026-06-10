import { useFormContext } from 'react-hook-form';
import { Barcode } from 'lucide-react';

interface VariantBasePricesSectionProps {
  isAdmin: boolean;
}

export const VariantBasePricesSection = ({ isAdmin }: VariantBasePricesSectionProps) => {
  // Traemos el objeto errors del contexto de validación
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="bg-white p-3 border border-slate-200 rounded-lg mb-4">
          <label className="flex items-center text-xs font-bold text-slate-700 mb-2">
            <Barcode className="w-4 h-4 mr-1.5 text-slate-500" /> Código de Barras (Unidad Suelta)
          </label>
          <input type="text" {...register('codigoBarras')} placeholder="Pistolear código o dejar vacío para autogenerar..." className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-slate-50" />
        </div>

        <h4 className="text-sm font-bold text-slate-700 mb-3">Precios e Inventario (Unidad Suelta)</h4>
        <div className="grid grid-cols-2 gap-4">
          {isAdmin ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Costo Compra *</label>
              <input type="number" step="any" {...register('precioCompra')} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
              {errors.precioCompra && <span className="text-[10px] text-red-500 mt-1 block">{errors.precioCompra.message as string}</span>}
            </div>
          ) : (
            <input type="hidden" {...register('precioCompra')} />
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Precio Venta (Público) *</label>
            <input type="number" step="any" {...register('precioVenta')} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
            {/* ✅ CORRECCIÓN: Renderiza el mensaje de error de Zod si precioVenta < precioCompra */}
            {errors.precioVenta && <span className="text-[10px] text-red-500 mt-1 block font-bold">{errors.precioVenta.message as string}</span>}
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Stock Mínimo Alerta</label>
            <input type="number" step="any" {...register('stockMinimo')} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary" />
            {errors.stockMinimo && <span className="text-[10px] text-red-500 mt-1 block">{errors.stockMinimo.message as string}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};