import { useEffect, useState } from 'react';
import { FileText, Search, Store } from 'lucide-react';
import { toast } from 'sonner';
import { KardexService } from '../services/kardex.api';
import type { KardexResponse } from '../types/kardex.types';
import { KardexAdjustmentModal } from '../components/KardexAdjustmentModal';
import { useStore } from '@/core/store/context/StoreContext';

// Importamos los dos nuevos fragmentos visuales desacoplados
import { KardexMobileCards } from '../components/KardexMobileCards';
import { KardexTable } from '../components/KardexTable';

export const KardexView = () => {
  const { activeStoreId } = useStore();
  const isGlobalMode = activeStoreId === null; 

  const [historial, setHistorial] = useState<KardexResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadHistorial = async () => {
    try {
      setIsLoading(true);
      const tiendaIdQuery = activeStoreId || 0; 
      const data = await KardexService.getHistorialCompleto(tiendaIdQuery);
      setHistorial(data);
    } catch (error) {
      toast.error('Error al cargar el historial del Kardex');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, [activeStoreId]);

  const filteredHistorial = historial.filter(item => 
    item.varianteSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.varianteNombre && item.varianteNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.notasInternas && item.notasInternas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatStoreName = (name: string) => {
    if (!name) return 'S/N';
    return name.length > 10 ? `${name.substring(0, 9)}.` : name;
  };

  const getOrigenBadge = (origen: string) => {
    const config: Record<string, { bg: string, text: string, label: string }> = {
      'INVENTARIO_INICIAL': { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Inv. Inicial' },
      'AJUSTE_MANUAL': { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', label: 'Ajuste Manual' },
      'COMPRA': { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'Compra' },
      'VENTA': { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', label: 'Venta' },
      'DEVOLUCION': { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'Devolución' },
      'TRASLADO': { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', label: 'Traslado' },
    };
    const style = config[origen] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: origen };
    return <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase whitespace-nowrap border border-transparent dark:border-current/10 ${style.bg} ${style.text}`}>{style.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center transition-colors">
            Kardex de Movimientos 
            {isGlobalMode && (
              <span className="ml-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center border border-transparent dark:border-indigo-900/30">
                <Store className="w-3 h-3 mr-1"/> Visión Global
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historial completo de entradas y salidas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar Producto, SKU o nota..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>
          
          {!isGlobalMode && (
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center px-4 py-2.5 sm:py-2 bg-primary dark:bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-sm whitespace-nowrap"
            >
              <FileText className="w-4 h-4 mr-2" />
              Nuevo Ajuste
            </button>
          )}
        </div>
      </div>

      {/* RENDERIZADO MÓVIL DESACOPLADO */}
      <KardexMobileCards 
        historial={filteredHistorial} 
        isLoading={isLoading} 
        isGlobalMode={isGlobalMode} 
        getOrigenBadge={getOrigenBadge} 
      />

      {/* RENDERIZADO ESCRITORIO DESACOPLADO */}
      <KardexTable 
        historial={filteredHistorial} 
        isLoading={isLoading} 
        isGlobalMode={isGlobalMode} 
        getOrigenBadge={getOrigenBadge} 
        formatStoreName={formatStoreName} 
      />

      {!isGlobalMode && (
        <KardexAdjustmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadHistorial} 
        />
      )}
    </div>
  );
};