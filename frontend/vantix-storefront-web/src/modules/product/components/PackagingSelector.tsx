import { PresentacionWebDTO } from "../../catalog/types/catalog.types";

interface PackagingSelectorProps {
  presentaciones: PresentacionWebDTO[];
  seleccionada: PresentacionWebDTO | null;
  onSelect: (p: PresentacionWebDTO | null) => void;
}

export const PackagingSelector = ({ presentaciones, seleccionada, onSelect }: PackagingSelectorProps) => {
  if (!presentaciones || presentaciones.length === 0) return null;

  return (
    <div className="space-y-2 pt-2">
      <span className="text-xs font-bold text-slate-600 block">
        Presentación / Empaque:
      </span>
      <div className="flex flex-wrap gap-2">
        {/* 🚀 ELIMINAMOS EL BOTÓN HARDCODEADO DE "UNIDAD" Y SOLO MOSTRAMOS LOS EMPAQUES */}
        {presentaciones.map((pres) => {
          const isSelected = seleccionada?.id === pres.id;
          return (
            <button
              key={pres.id}
              type="button"
              onClick={() => onSelect(pres)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-fuchsia-300"
              }`}
            >
              {pres.nombre} (S/ {pres.precioVenta.toFixed(2)})
            </button>
          );
        })}
      </div>
    </div>
  );
};