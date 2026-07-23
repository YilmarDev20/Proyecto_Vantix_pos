"use client";

import { Layers } from "lucide-react";
import { VarianteWebDTO } from "../../catalog/types/catalog.types";

interface VariantSelectorProps {
  variantes: VarianteWebDTO[];
  seleccionada: VarianteWebDTO | null;
  onSelect: (v: VarianteWebDTO) => void;
}

export const VariantSelector = ({ variantes, seleccionada, onSelect }: VariantSelectorProps) => {
  if (!variantes || variantes.length <= 1) return null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
        <Layers className="w-3.5 h-3.5 text-fuchsia-600" />
        <span>Selecciona Opciones / Variedad:</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const isSelected = seleccionada?.id === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isSelected
                  ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {v.nombreVariante || v.sku}
            </button>
          );
        })}
      </div>
    </div>
  );
};