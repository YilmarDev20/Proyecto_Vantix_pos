import { useState, useEffect } from 'react';
import { PackageSearch, Tags, ArrowRightLeft, Boxes, Printer, Store } from 'lucide-react';
import { useAuth } from '@/core/auth/context/AuthContext'; 
import { useStore } from '@/core/store/context/StoreContext'; 

import { CategoryView } from '../category/views/CategoryView';
import { ProductView } from '../product/views/ProductView';
import { KardexView } from '../kardex/views/KardexView'; 
import { TransfersLayout } from '@/features/inventory/transfers/views/TransfersLayout';
import { LabelPrintingView } from '../labels/views/LabelPrintingView'; 

type InventoryTabType = 'productos' | 'etiquetas' | 'categorias' | 'kardex' | 'traslados';

export const InventoryLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';
  
  const { activeStoreId } = useStore();
  
  const [activeTab, setActiveTab] = useState<InventoryTabType>(() => {
    const savedTab = localStorage.getItem('vantix_active_inventory_tab') as InventoryTabType;
    if (savedTab === 'categorias' || savedTab === 'kardex') {
      return isAdmin ? savedTab : 'productos';
    }
    return savedTab || 'productos';
  });

  useEffect(() => {
    localStorage.setItem('vantix_active_inventory_tab', activeTab);
  }, [activeTab]);

  const isGlobalMode = !activeStoreId;
  const isTabBlockedInGlobal = ['productos', 'etiquetas', 'traslados'].includes(activeTab);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Catálogo e Inventario</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Gestiona tus productos, categorías, stock e impresión masiva de etiquetas de barras.
        </p>
      </div>

      {/* CONTENEDOR DE PESTAÑAS ADAPTATIVO */}
      <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-fit mb-6 overflow-x-auto scrollbar-hide transition-colors">
        
        <button
          type="button"
          onClick={() => setActiveTab('productos')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'productos' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4 mr-2" />
          Productos y Variantes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('etiquetas')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'etiquetas' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Etiquetas
        </button>

        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('categorias')}
              className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'categorias' 
                  ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Tags className="w-4 h-4 mr-2" />
              Familias y Categorías
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kardex')}
              className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'kardex' 
                  ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PackageSearch className="w-4 h-4 mr-2" />
              Kardex (Movimientos)
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('traslados')}
          className={`flex items-center whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'traslados' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Traslados
        </button>
      </div>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <div className="flex-1 overflow-y-auto pb-6">
        
        {/* PANEL DE ADVERTENCIA PARA MODO GLOBAL */}
        {isGlobalMode && isTabBlockedInGlobal ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in zoom-in-95 duration-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-5 shadow-inner border border-blue-100 dark:border-blue-900/50 transition-colors">
              <Store className="w-10 h-10 text-primary dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Visión Global Activa</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed text-sm">
              Por seguridad, <strong className="text-slate-700 dark:text-slate-300">no es posible gestionar esta sección</strong> en el modo global.
              <br /><br />
              Por favor, selecciona una tienda específica en el menú superior o navega a una pestaña analítica (como el Kardex).
            </p>
          </div>
        ) : (
          /* RENDERIZADO NORMAL DE VISTAS */
          <>
            {activeTab === 'productos' && <ProductView />}
            {activeTab === 'etiquetas' && <LabelPrintingView />}
            {activeTab === 'categorias' && isAdmin && <CategoryView />}
            {activeTab === 'kardex' && isAdmin && <KardexView />}
            {activeTab === 'traslados' && <TransfersLayout />}
          </>
        )}

      </div>
      
    </div>
  );
};