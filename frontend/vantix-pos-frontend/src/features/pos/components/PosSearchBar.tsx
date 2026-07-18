import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X } from 'lucide-react';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';
import { toast } from 'sonner';

interface PosSearchBarProps {
  variantes: Variant[];
  productos: Product[];
  onAddProduct: (variante: Variant, presentacion?: Presentacion) => void;
  onOpenPresentationModal: (variante: Variant) => void; 
}

export const PosSearchBar = ({ variantes, productos, onAddProduct, onOpenPresentationModal }: PosSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatVariantName = (v: Variant) => {
    const prod = productos.find((p) => p.id === v.productoId);
    let baseName = 'Producto Desconocido';
    
    if (prod) {
      baseName = prod.marca ? `${prod.nombre} [${prod.marca}]` : prod.nombre;
    }

    if (!v.atributos || Object.keys(v.atributos).length === 0) return baseName;
    
    const attrValues = Object.values(v.atributos).filter(val => val !== null && val !== '').join(' ');
    
    return attrValues ? `${baseName} - ${attrValues}` : baseName;
  };

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9\s]/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();
  };

  const variantesFiltradas = searchTerm.trim() === '' ? [] : variantes.filter(v => {
    const searchNormalized = normalizeText(searchTerm);
    const nameNormalized = normalizeText(formatVariantName(v));
    const skuNormalized = normalizeText(v.sku);
    
    if (skuNormalized.includes(searchNormalized) || 
       (v.codigoBarras && normalizeText(v.codigoBarras) === searchNormalized) || 
       nameNormalized.includes(searchNormalized)) return true;

    if (v.presentaciones) {
      return v.presentaciones.some(p => p.codigoBarras && normalizeText(p.codigoBarras) === searchNormalized);
    }
    
    return false;
  }).slice(0, 10);

  const handleAddDirect = (variante: Variant, presentacion?: Presentacion) => {
    const factor = presentacion ? presentacion.factorConversion : 1;
    if (variante.stockActual < factor) {
      toast.error(`Stock agotado para: ${formatVariantName(variante)}${presentacion ? ' - ' + presentacion.nombre : ''}`);
      return;
    }
    onAddProduct(variante, presentacion);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = searchTerm.trim();
      if (!term) return;

      let matchedVariant: Variant | undefined = undefined;
      let matchedPresentation: Presentacion | undefined = undefined;

      // 🔍 1. Jerarquía de búsqueda inteligente por códigos de barra exactos:
      
      // Paso A: ¿Coincide con algún empaque / presentación secundaria de alguna variante?
      for (const v of variantes) {
        const pres = v.presentaciones?.find(p => p.codigoBarras === term);
        if (pres) {
          matchedVariant = v;
          matchedPresentation = pres;
          break;
        }
      }

      // Paso B: Si no fue un empaque, ¿coincide directamente con el código de barras exclusivo de la variante base?
      if (!matchedVariant) {
        matchedVariant = variantes.find(v => v.codigoBarras === term);
      }

      // Paso C: Si aún no coincide por código de barras, buscar por SKU exacto
      if (!matchedVariant) {
        matchedVariant = variantes.find(v => v.sku === term);
      }

      // 🛒 2. Despacho inteligente inmediato sin modales redundantes
      if (matchedVariant) {
        if (matchedPresentation) {
          // Si escaneó el código de la Caja, agregar la Caja directamente
          handleAddDirect(matchedVariant, matchedPresentation);
        } else if (matchedVariant.codigoBarras === term) {
          // Si escaneó el código exacto de la Unidad Base, agregar la Unidad directamente (OMITIENDO EL MODAL)
          handleAddDirect(matchedVariant);
        } else {
          // Si entró aquí por SKU u otro texto, y tiene empaques, abrir el modal de selección
          if (matchedVariant.presentaciones && matchedVariant.presentaciones.length > 0) {
            onOpenPresentationModal(matchedVariant); 
            setSearchTerm('');
            inputRef.current?.focus();
          } else {
            handleAddDirect(matchedVariant); 
          }
        }
      } else if (variantesFiltradas.length === 1) {
        const v = variantesFiltradas[0];
        // Si el término escrito coincide con el código de barras exacto de la base, agregamos sin modal
        if (v.codigoBarras === term) {
          handleAddDirect(v);
        } else if (v.presentaciones && v.presentaciones.length > 0) {
          onOpenPresentationModal(v);
          setSearchTerm('');
        } else {
          handleAddDirect(v);
        }
      } else if (variantesFiltradas.length > 1) {
        toast.info('Hay varios productos que coinciden. Selecciona uno de la lista.');
      } else {
        toast.error('Producto no encontrado');
      }
    }
  };

  const handleListClick = (v: Variant) => {
    if (v.presentaciones && v.presentaciones.length > 0) {
      onOpenPresentationModal(v);
      setSearchTerm('');
    } else {
      handleAddDirect(v);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 shrink-0 transition-colors">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Pistolear código de barras o buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-14 pr-12 py-4 text-lg border-2 border-blue-100 dark:border-slate-800 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none transition-colors shadow-inner font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-colors" title="Limpiar búsqueda">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {searchTerm && variantesFiltradas.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
          {variantesFiltradas.map((v) => (
            <div 
              key={v.id} 
              onClick={() => handleListClick(v)} 
              className="flex justify-between items-center p-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{formatVariantName(v)}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">SKU: {v.sku}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                    v.stockActual > 0 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                  }`}>
                    Stock: {v.stockActual}
                  </span>
                  <span className="font-black text-primary dark:text-blue-400">S/ {v.precioVenta.toFixed(2)}</span>
                  
                  {v.presentaciones && v.presentaciones.length > 0 && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded">
                      Ver packs
                    </span>
                  )}
                </div>
              </div>
              <button type="button" className="p-2 bg-slate-100 dark:bg-slate-800 text-primary dark:text-blue-400 rounded-lg hover:bg-primary dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};