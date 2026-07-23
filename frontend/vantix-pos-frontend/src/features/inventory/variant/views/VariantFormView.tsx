import { ArrowLeft } from 'lucide-react';
import { VariantForm } from '../components/VariantForm';
import type { Variant, VariantRequest } from '../types/variant.types';

interface VariantFormViewProps {
  productId: number;
  productName?: string;
  initialData?: Variant | null;
  onSubmit: (data: VariantRequest) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const VariantFormView = ({
  productId,
  productName,
  initialData,
  onSubmit,
  onBack,
  isLoading,
}: VariantFormViewProps) => {
  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {/* CABECERA CON BOTÓN ATRÁS */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          title="Volver a la lista"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Variante' : 'Nueva Variante / Presentación'}
          </h2>
          {productName && (
            <p className="text-sm text-slate-500">
              Producto: <span className="font-semibold text-slate-700">{productName}</span>
            </p>
          )}
        </div>
      </div>

      {/* FORMULARIO EN CONTENEDOR AMPLIO DE PANTALLA COMPLETA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <VariantForm
          productoId={productId}
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onBack}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};