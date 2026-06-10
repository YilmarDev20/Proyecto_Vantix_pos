import { useState } from 'react';
import { Search, Package, Tag, Layers } from 'lucide-react';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';
import { toast } from 'sonner';

interface PosCatalogBrowserProps {
  variantes: Variant[];
  productos: Product[];
  onAddProduct: (variante: Variant, presentacion?: Presentacion) => void;
  onOpenPresentationModal: (variante: Variant) => void;
}

export const PosCatalogBrowser = ({ variantes, productos, onAddProduct, onOpenPresentationModal }: PosCatalogBrowserProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9\s]/g, ' ') 
      .replace(/\s+/g, ' ') 
      .trim();
  };

  const formatVariantName = (v: Variant) => {
    const prod = productos.find((p) => p.id === v.productoId);
    let baseName = 'Producto Desconocido';
    if (prod) {
      baseName = prod.marca ? `${prod.nombre} [${prod.marca}]` : prod.nombre;
    }
    return baseName;
  };

  const formatAtributos = (v: Variant) => {
    if (!v.atributos || Object.keys(v.atributos).length === 0) return '';
    return Object.values(v.atributos).filter(val => val !== null && val !== '').join(' | ');
  };

  const variantesFiltradas = variantes.filter(v => {
    if (!v.estado) return false;
    if (searchTerm.trim() === '') return true;

    const searchNormalized = normalizeText(searchTerm);
    
    const nombre = formatVariantName(v);
    const attrs = formatAtributos(v);
    const fullTextNormalized = normalizeText(`${nombre} ${attrs} ${v.sku} ${v.codigoBarras || ''}`);
    
    const searchWords = searchNormalized.split(' ');
    const matchesSearch = searchWords.every(word => fullTextNormalized.includes(word));
    
    let matchesPack = false;
    if (!matchesSearch && v.presentaciones) {
      matchesPack = v.presentaciones.some(p => p.codigoBarras && normalizeText(p.codigoBarras) === searchNormalized);
    }

    return matchesSearch || matchesPack;
  }).slice(0, 30); 

  const handleCardClick = (v: Variant) => {
    if (v.presentaciones && v.presentaciones.length > 0) {
      onOpenPresentationModal(v);
    } else {
      if (v.stockActual < 1) {
        toast.error(`Stock agotado para: ${formatVariantName(v)}`);
        return;
      }
      onAddProduct(v);
      toast.success('Agregado a la canasta', { duration: 1000 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 relative z-10 shadow-sm transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o talla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {variantesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
            <Package className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-bold">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 pb-20">
            {variantesFiltradas.map(v => {
              const nombre = formatVariantName(v);
              const attrs = formatAtributos(v);
              const hasPacks = v.presentaciones && v.presentaciones.length > 0;
              const isOutOfStock = v.stockActual <= 0;

              const prodPadre = productos.find((p) => p.id === v.productoId);
              const urlImagenFinal = v.imagenUrl || prodPadre?.imagenUrl || null;

              return (
                <button
                  key={v.id}
                  onClick={() => handleCardClick(v)}
                  className={`relative flex flex-col text-left bg-white dark:bg-slate-900 rounded-2xl p-3 border-2 transition-all group overflow-hidden ${
                    isOutOfStock 
                      ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed grayscale-[50%]' 
                      : 'border-slate-100 dark:border-slate-800/40 hover:border-primary dark:hover:border-blue-500 hover:shadow-md active:scale-95'
                  }`}
                >
                  {/* CONTENEDOR DE IMAGEN OPTIMIZADO */}
                  <div className="w-full aspect-square bg-slate-50 dark:bg-slate-950 rounded-xl mb-3 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    {urlImagenFinal ? (
                      <img 
                        src={`${import.meta.env.VITE_BASE_URL}${urlImagenFinal}`} 
                        alt={nombre}
                        loading="lazy" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Tag className="w-8 h-8 text-slate-300 dark:text-slate-700 group-hover:text-primary/40 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex-1 w-full">
                    {/* ✅ ADAPTACIÓN: Título y atributos adaptados a contrastes legibles de noche */}
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight line-clamp-2 mb-1">{nombre}</h4>
                    {attrs && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1 truncate">{attrs}</p>}
                    <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mb-2">SKU: {v.sku}</p>
                  </div>

                  <div className="w-full flex items-end justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-0.5">Precio</p>
                      <p className="font-black text-primary dark:text-blue-400 text-base leading-none">S/ {v.precioVenta.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {/* ✅ ADAPTACIÓN: Insignias de stock con fondos sutiles traslúcidos */}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                        isOutOfStock 
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                          : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {v.stockActual} u
                      </span>
                    </div>
                  </div>

                  {hasPacks && (
                    <div className="absolute top-2 right-2 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center">
                      <Layers className="w-3 h-3 mr-0.5" /> PACKS
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};