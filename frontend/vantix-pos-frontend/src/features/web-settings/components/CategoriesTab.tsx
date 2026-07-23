import type { ConfiguracionWebDTO } from "../types/web-settings.types";

interface Props {
  form: ConfiguracionWebDTO;
  categorias: any[];
  onToggleCategoria: (catId: number) => void;
}

export const CategoriesTab = ({ form, categorias, onToggleCategoria }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
          Selecciona las 3 Categorías Principales
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Estas categorías aparecerán con acceso rápido directo en la pantalla de inicio del catálogo web.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categorias.map((cat: any) => {
          const isSelected = form.categoriasDestacadasIds?.includes(cat.id);

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onToggleCategoria(cat.id)}
              className={`p-3.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <span>{cat.nombre}</span>
              {isSelected && <span className="text-xs font-black bg-fuchsia-600 text-white px-2 py-0.5 rounded-full">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};