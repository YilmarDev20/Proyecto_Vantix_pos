import { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Variant } from '../../variant/types/variant.types';

interface VariantSearchProps {
  variants: Variant[];
  onAddVariant: (variant: Variant) => void;
  formatName: (v: Variant) => string;
}

export const VariantSearch = ({ variants, onAddVariant, formatName }: VariantSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredVariants = variants.filter(v => {
    if (!v.estado) return false; 
    
    const searchLower = searchTerm.toLowerCase();
    const nombreCompleto = formatName(v).toLowerCase();
    
    return (
      nombreCompleto.includes(searchLower) ||
      v.sku.toLowerCase().includes(searchLower) ||
      (v.codigoBarras && v.codigoBarras.toLowerCase().includes(searchLower)) ||
      (v.atributos && JSON.stringify(v.atributos).toLowerCase().includes(searchLower))
    );
  }).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (variant: Variant) => {
    onAddVariant(variant);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar producto por nombre, marca, SKU o código..." 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none text-slate-700 dark:text-slate-100 font-medium transition-all bg-white dark:bg-slate-900 focus:bg-blue-50/10 dark:focus:bg-slate-950/40 shadow-sm"
        />
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 transition-colors">
          {filteredVariants.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm font-medium bg-white dark:bg-slate-900">
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              {filteredVariants.map(v => (
                <li key={v.id}>
                  <button 
                    type="button"
                    onClick={() => handleSelect(v)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{formatName(v)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        SKU: <span className="font-mono text-slate-400 dark:text-slate-500">{v.sku}</span> • Stock actual: <span className="font-bold text-amber-600 dark:text-amber-400">{v.stockActual}</span>
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-primary dark:text-blue-400 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};