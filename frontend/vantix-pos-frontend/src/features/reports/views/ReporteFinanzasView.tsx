import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { FinancesReportService } from '../services/finances.api';
import type { ReporteFinanzas } from '../types/finances.types';

import { DateRangePicker } from '../components/DateRangePicker';
import { FinancesSummaryCards } from '../components/finances/FinancesSummaryCards';
import { PaymentMethodsChart } from '../components/finances/PaymentMethodsChart';
import { FinancesHistoryTable } from '../components/finances/FinancesHistoryTable';
import { CashFlowChart } from '../components/finances/CashFlowChart'; 

export const ReporteFinanzasView = () => {
  const { activeStoreId } = useStore();
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(currentDay);
  const [data, setData] = useState<ReporteFinanzas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReporte = async (customStart?: string, customEnd?: string) => {
    try {
      setIsLoading(true);
      const queryStart = customStart || startDate;
      const queryEnd = customEnd || endDate;
      
      const result = await FinancesReportService.getResumenFinanciero(activeStoreId, queryStart, queryEnd);
      setData(result);
    } catch (error) {
      toast.error('Error al cargar el reporte financiero');
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
          <div className="w-8 h-8 border-4 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mr-3"></div>
          Cuadrando movimientos de caja...
        </div>
      ) : !data ? (
        <div className="flex justify-center items-center h-64 text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
          Selecciona un rango de fechas para ver el reporte de finanzas.
        </div>
      ) : (
        <>
          <FinancesSummaryCards data={data} />
          
          {/* GRILLA SUPERIOR: LOS 2 GRÁFICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <PaymentMethodsChart pagos={data.distribucionPagos} />
            <CashFlowChart movimientos={data.historialMovimientos} />
          </div>

          {/* PARTE INFERIOR: LA TABLA A ANCHO COMPLETO */}
          <div className="w-full mt-2">
            <FinancesHistoryTable movimientos={data.historialMovimientos} />
          </div>
        </>
      )}
    </div>
  );
};