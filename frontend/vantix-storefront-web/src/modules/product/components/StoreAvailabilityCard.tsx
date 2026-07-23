"use client";

import { Store, CheckCircle, Flame, XCircle } from "lucide-react";
import { DisponibilidadSedeDTO } from "../../catalog/types/catalog.types";

interface StoreAvailabilityCardProps {
  sedes: DisponibilidadSedeDTO[];
}

export const StoreAvailabilityCard = ({ sedes }: StoreAvailabilityCardProps) => {
  if (!sedes || sedes.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-xs">
        <Store className="w-4 h-4 text-fuchsia-600" />
        <span>Disponibilidad en Tiendas Zarely:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sedes.map((sede) => {
          const esDisponible = sede.estadoStock === "DISPONIBLE";
          const esUltimas = sede.estadoStock === "ULTIMAS_UNIDADES";

          return (
            <div
              key={sede.tiendaId}
              className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs shadow-2xs"
            >
              <span className="font-bold text-slate-800">{sede.tiendaNombre}</span>

              {esDisponible && (
                <span className="flex items-center space-x-1 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Disponible</span>
                </span>
              )}

              {esUltimas && (
                <span className="flex items-center space-x-1 text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                  <span>¡Últimas unidades!</span>
                </span>
              )}

              {!esDisponible && !esUltimas && (
                <span className="flex items-center space-x-1 text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                  <XCircle className="w-3 h-3" />
                  <span>Agotado</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};