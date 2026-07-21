import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Plus, Package } from 'lucide-react';
import type { Variant } from '@/features/inventory/variant/types/variant.types';

interface AdvancedProductSearchProps {
  items: Variant[];
  onSelectItem: (item: Variant) => void;
  customFormatName?: (item: Variant) => string;
  placeholder?: string;
}

export const AdvancedProductSearch = ({
  items,
  onSelectItem,
  customFormatName,
  placeholder = "Buscar por nombre, SKU, barra o prefijo..."
}: AdvancedProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [itemsVisibles, setItemsVisibles] = useState(15); 
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultFormatName = (v: Variant) => {
    const nombre = v.productoNombre || 'Producto';
    const marca = v.marcaNombre ? `[${v.marcaNombre}]` : '';
    
    let textoAtributos = '';
    if (v.atributos && typeof v.atributos === 'object') {
      textoAtributos = Object.values(v.atributos)
        .filter(val => typeof val === 'string' || typeof val === 'number')
        .join(' ');
    }

    return `${nombre} ${marca} ${textoAtributos ? `- ${textoAtributos}` : ''}`
      .trim()
      .replace(/\s+/g, ' ');
  };

  const formatName = customFormatName || defaultFormatName;

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[\[\]\-,]/g, ' ') 
      .replace(/[^a-z0-9\s]/g, '') 
      .replace(/\s+/g, ' ') 
      .trim();
  };

  // Motor de Búsqueda Inteligente Multi-Empaque
  const filteredItems = useMemo(() => {
    const query = searchTerm.trim();
    if (query === '') return [];

    const searchNormalized = normalizeText(query);
    const tokensBusqueda = searchNormalized.split(' ').filter(t => t.length > 0);

    if (tokensBusqueda.length === 0) return [];

    return items
      .filter(v => {
        if (v.estado === false) return false;

        const nameNormalized = normalizeText(formatName(v));
        const skuNormalized = normalizeText(v.sku || '');
        const cbNormalized = normalizeText(v.codigoBarras || '');

        // 🚀 NUEVO: Concatenamos los códigos de barras de todas las presentaciones del producto
        const cbPresentacionesNormalized = (v.presentaciones || [])
          .filter(p => p.estado !== false && p.codigoBarras)
          .map(p => normalizeText(p.codigoBarras || ''))
          .join(' ');

        const bloqueTextoTotal = `${nameNormalized} ${skuNormalized} ${cbNormalized} ${cbPresentacionesNormalized}`;

        return tokensBusqueda.every(token => bloqueTextoTotal.includes(token));
      })
      .sort((a, b) => {
        // Prioriza si el código coincide exactamente con el base o con alguna presentación
        const queryLower = query.toLowerCase();
        
        const aCBExactoPres = (a.presentaciones || []).some(p => p.codigoBarras?.toLowerCase() === queryLower);
        const bCBExactoPres = (b.presentaciones || []).some(p => p.codigoBarras?.toLowerCase() === queryLower);

        const aExacto = a.sku?.toLowerCase() === queryLower || a.codigoBarras?.toLowerCase() === queryLower || aCBExactoPres;
        const bExacto = b.sku?.toLowerCase() === queryLower || b.codigoBarras?.toLowerCase() === queryLower || bCBExactoPres;
        
        if (aExacto && !bExacto) return -1;
        if (!aExacto && bExacto) return 1;
        return 0;
      });
  }, [searchTerm, items, formatName]);

  // 🚀 INTERCEPTOR INTELIGENTE DE ESCANEO DIRECTO
  // Si lo ingresado coincide exactamente con un código de barras de presentación, lo añade al instante
  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 3) return; // Evita falsos positivos con textos cortos

    const queryLower = query.toLowerCase();

    for (const item of items) {
      if (!item.estado) continue;

      // Buscamos si el código escaneado pertenece a una presentación de este ítem
      const presentacionDetectada = (item.presentaciones || []).find(
        p => p.estado !== false && p.codigoBarras && p.codigoBarras.toLowerCase() === queryLower
      );

      if (presentacionDetectada) {
        // Clonamos la variante en caliente inyectando la presentación detectada
        const itemClonado = {
          ...item,
          // Guardamos una propiedad temporal para que useCart o AdjustmentTable sepan qué empaque usar
          presentacionPreseleccionada: presentacionDetectada,
          // Mapeamos el factor en caliente por si el componente padre lo lee directo
          factorConversion: presentacionDetectada.factorConversion 
        };
        
        onSelectItem(itemClonado as any);
        setSearchTerm('');
        setIsOpen(false);
        return; 
      }
    }
  }, [searchTerm, items, onSelectItem]);

  useEffect(() => {
    setItemsVisibles(15);
    if (dropdownRef.current) {
      dropdownRef.current.scrollTop = 0;
    }
  }, [searchTerm]);

  const handleScroll = () => {
    if (!dropdownRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
    
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (itemsVisibles < filteredItems.length) {
        setItemsVisibles(prev => prev + 15);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: Variant) => {
    onSelectItem(item);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const itemsAMostrar = filteredItems.slice(0, itemsVisibles);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder={placeholder} 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none text-slate-700 dark:text-slate-100 font-medium transition-all bg-white dark:bg-slate-900 focus:bg-blue-50/10 dark:focus:bg-slate-950/40 shadow-sm"
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={clearSearch} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && searchTerm.trim().length > 0 && (
        <div 
          ref={dropdownRef}
          onScroll={handleScroll}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-80 overflow-y-auto"
        >
          {itemsAMostrar.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {itemsAMostrar.map(item => {
                // Buscamos si esta variante fue encontrada por coincidencia en una de sus presentaciones
                const queryLower = searchTerm.trim().toLowerCase();
                const presCoincidente = (item.presentaciones || []).find(
                  p => p.estado !== false && p.codigoBarras && p.codigoBarras.toLowerCase().includes(queryLower)
                );

                return (
                  <li key={item.id}>
                    <button 
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {formatName(item)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>SKU: <span className="font-mono text-slate-400 dark:text-slate-500">{item.sku}</span></span>
                          {item.stockActual !== undefined && (
                            <><span>•</span> <span>Stock: <span className="font-bold text-amber-600 dark:text-amber-400">{item.stockActual} u.</span></span></>
                          )}
                          {item.precioVenta !== undefined && (
                            <><span>•</span> <span className="font-extrabold text-primary dark:text-blue-400">S/ {item.precioVenta.toFixed(2)}</span></>
                          )}
                          
                          {/* Indicator visual de que se encontró por presentación mayorista */}
                          {presCoincidente && (
                            <span className="ml-2 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded">
                              <Package className="w-3 h-3 mr-1" /> Contiene: {presCoincidente.nombre}
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-primary dark:text-blue-400 shrink-0" />
                    </button>
                  </li>
                );
              })}
              
              {itemsVisibles < filteredItems.length && (
                <li className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/20 font-bold uppercase tracking-wider">
                  Desliza para ver más variantes...
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};