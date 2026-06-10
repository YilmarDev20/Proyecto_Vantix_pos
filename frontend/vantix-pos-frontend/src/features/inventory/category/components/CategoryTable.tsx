import { Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import type { Category } from '../types/category.types';

interface CategoryTableProps {
  categories: Category[];
  getParentName: (parentId: number | null) => string;
  onEdit: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export const CategoryTable = ({ categories, getParentName, onEdit, onToggleStatus, onDelete }: CategoryTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <tr>
          <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre</th>
          <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Prefijo</th>
          <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría Padre</th>
          <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Estado</th>
          <th className="py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
        {categories.map((cat) => (
          <tr key={cat.id} className={`transition-colors ${cat.estado ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-slate-50 dark:bg-slate-950/40 opacity-75'}`}>
            <td className="py-3 px-6 text-sm font-bold text-slate-800 dark:text-slate-200">{cat.nombre}</td>
            <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">{cat.codigoPrefijo}</span>
            </td>
            <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
              {cat.categoriaPadreId === null ? <span className="text-slate-400 dark:text-slate-600 italic">-- Principal --</span> : getParentName(cat.categoriaPadreId)}
            </td>
            <td className="py-3 px-6 text-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.estado ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {cat.estado ? 'Activa' : 'Inactiva'}
              </span>
            </td>
            <td className="py-3 px-6 text-sm flex items-center justify-center space-x-2">
              <button type="button" onClick={() => onEdit(cat)} className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onToggleStatus(cat)} className={`p-2 rounded-lg transition-colors ${cat.estado ? 'text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800' : 'text-slate-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800'}`}>
                {cat.estado ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => onDelete(cat)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);