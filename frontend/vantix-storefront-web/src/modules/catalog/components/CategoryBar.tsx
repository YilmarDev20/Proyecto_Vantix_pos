import { CategoriaPublicaDTO } from "../types/catalog.types";

interface CategoryBarProps {
  categorias: CategoriaPublicaDTO[];
  categoriaSeleccionada: number | null;
  onSelectCategory: (id: number | null) => void;
}

export const CategoryBar = ({ categorias, categoriaSeleccionada, onSelectCategory }: CategoryBarProps) => {
  if (categorias.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
          categoriaSeleccionada === null
            ? "bg-fuchsia-600 text-white shadow-md"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
        }`}
      >
        ✨ Todos los Productos
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            categoriaSeleccionada === cat.id
              ? "bg-fuchsia-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
};