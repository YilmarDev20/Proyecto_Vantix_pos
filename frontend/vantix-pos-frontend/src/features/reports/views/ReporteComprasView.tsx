import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { PurchasesReportService } from '../services/purchases.api';
import type { ReporteCompras } from '../types/purchases.types';

import { DateRangePicker } from '../components/DateRangePicker';
import { PurchasesSummaryCards } from '../components/purchases/PurchasesSummaryCards';
import { CategoryInvestmentChart } from '../components/purchases/CategoryInvestmentChart';
import { StoreInvestmentChart } from '../components/purchases/StoreInvestmentChart';
import { PurchasesDataTable } from '../components/purchases/PurchasesDataTable';

export const ReporteComprasView = () => {
  const { activeStoreId } = useStore();
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(currentDay);
  const [data, setData] = useState<ReporteCompras | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReporte = async (customStart?: string, customEnd?: string) => {
    try {
      setIsLoading(true);
      const queryStart = customStart || startDate;
      const queryEnd = customEnd || endDate;
      
      const result = await PurchasesReportService.getResumenCompras(activeStoreId, queryStart, queryEnd);
      setData(result);
    } catch (error) {
      toast.error('Error al cargar el reporte de compras y deudas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* 1. Selector de Fechas */}
      <DateRangePicker 
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={fetchReporte}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-slate-500 dark:text-slate-400 font-bold">
          <div className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mr-3"></div>
          Analizando inversiones y cuentas por pagar...
        </div>
      ) : !data ? (
        <div className="flex justify-center items-center h-64 text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
          Selecciona un rango de fechas para ver el reporte de compras.
        </div>
      ) : (
        <>
          {/* 2. Tarjetas de Resumen Financiero */}
          <PurchasesSummaryCards data={data} />
          
          {/* 3. Fila de Gráficos de Inversión (Categorías y Tiendas) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <CategoryInvestmentChart data={data.inversionPorCategoria} />
            <StoreInvestmentChart data={data.inversionPorTienda} />
          </div>

          {/* 4. Tabla Híbrida de Historial y Deudas */}
          <div className="w-full mt-2">
            <PurchasesDataTable deudas={data.rankingDeudas} historial={data.historialCompras} />
          </div>
        </>
      )}
    </div>
  );
};