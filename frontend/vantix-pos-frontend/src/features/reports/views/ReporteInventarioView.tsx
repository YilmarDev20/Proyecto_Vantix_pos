import { useState, useEffect, useMemo } from 'react';
import { PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { InventoryReportService } from '../services/inventory.api';
import type { InventarioPredictivo } from '../types/inventory.types';

import { PredictiveTable } from '../components/inventory/PredictiveTable';
import { PredictiveModal } from '../components/inventory/PredictiveModal';
import { PredictiveFilters } from '../components/inventory/PredictiveFilters';

export const ReporteInventarioView = () => {
  const { activeStoreId } = useStore();
  const [data, setData] = useState<InventarioPredictivo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diasAnalisis, setDiasAnalisis] = useState<number>(30);
  const [selectedProduct, setSelectedProduct] = useState<InventarioPredictivo | null>(null);

  // Estados de los Filtros Avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [sortBy, setSortBy] = useState('DIAS_ASC');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  const fetchReporte = async () => {
    try {
      setIsLoading(true);
      const result = await InventoryReportService.getInventarioPredictivo(activeStoreId, diasAnalisis);
      setData(result);
    } catch (error) {
      toast.error('Error al cargar la predicción de inventario');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReporte(); }, [activeStoreId]);

  // EL MOTOR DE FILTRADO Y ORDENAMIENTO EN TIEMPO REAL
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter(item => item.nombreFormateado.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'TODOS') {
      result = result.filter(item => item.estadoAlerta.includes(statusFilter));
    }
    if (showOnlyLowStock) {
      result = result.filter(item => item.isBajoStockMinimo);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'VENTAS_DESC': return b.ventasUltimosDias - a.ventasUltimosDias;
        case 'MARGEN_DESC': return b.margenGanancia - a.margenGanancia;
        case 'STOCK_ASC': return a.stockActual - b.stockActual;
        case 'DIAS_ASC': 
        default: return a.diasRestantesEstimados - b.diasRestantesEstimados;
      }
    });

    return result;
  }, [data, searchTerm, statusFilter, sortBy, showOnlyLowStock]);

  return (
    <div className="flex flex-col gap-6 relative animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center transition-colors"><PackageOpen className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" /> Análisis Predictivo de Catálogo</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Evalúa la salud de tu stock y toma decisiones de compra inteligentes.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap transition-colors">Periodo:</span>
          <select value={diasAnalisis} onChange={(e) => setDiasAnalisis(Number(e.target.value))} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg px-3 py-2 outline-none transition-colors">
            <option value={7}>Últimos 7 días</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={60}>Últimos 60 días</option>
          </select>
          <button type="button" onClick={fetchReporte} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-sm border border-transparent">
            {isLoading ? 'Calculando...' : 'Analizar'}
          </button>
        </div>
      </div>

      <PredictiveFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} sortBy={sortBy} setSortBy={setSortBy} showOnlyLowStock={showOnlyLowStock} setShowOnlyLowStock={setShowOnlyLowStock} />

      <PredictiveTable data={filteredAndSortedData} isLoading={isLoading} diasAnalisis={diasAnalisis} onRowClick={setSelectedProduct} />

      {selectedProduct && <PredictiveModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
};