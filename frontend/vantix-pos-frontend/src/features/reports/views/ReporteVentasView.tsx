import { useState, useEffect } from 'react';
import { Users, UserMinus, DollarSign, Wallet, ArrowDownRight, Award } from 'lucide-react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { SalesReportService } from '../services/sales.api';
import type { ReporteVentas } from '../types/sales.types';
import { DateRangePicker } from '../components/DateRangePicker';

export const ReporteVentasView = () => {
  const { activeStoreId } = useStore();
  
  // Por defecto, calculamos el mes actual
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(currentDay);
  const [data, setData] = useState<ReporteVentas | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReporte = async (customStart?: string, customEnd?: string) => {
    try {
      setIsLoading(true);
      const queryStart = customStart || startDate;
      const queryEnd = customEnd || endDate;
      
      const result = await SalesReportService.getReporteVentas(activeStoreId, queryStart, queryEnd);
      setData(result);
    } catch (error) {
      toast.error('Error al cargar el reporte de ventas y rentabilidad');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoreId]);

  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* FILTRO DE FECHAS */}
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
          Procesando rentabilidad...
        </div>
      ) : !data ? (
        <div className="flex justify-center items-center h-64 text-slate-400 dark:text-slate-500 font-bold bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 transition-colors">
          Selecciona un rango de fechas para ver el reporte.
        </div>
      ) : (
        <>
          {/* 1. TARJETAS DE RENTABILIDAD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ventas Totales</p>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400"><DollarSign className="w-5 h-5" /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">{formatCurrency(data.ventasTotales)}</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">Ingreso bruto facturado</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Costo de Inventario</p>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-600 dark:text-rose-400"><ArrowDownRight className="w-5 h-5" /></div>
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">{formatCurrency(data.costoTotalInventario)}</h3>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">Costo histórico de productos vendidos</p>
            </div>

            <div className="bg-indigo-600 dark:bg-indigo-700 p-6 rounded-2xl shadow-md border border-indigo-700 dark:border-indigo-800 text-white relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24" /></div>
              <p className="text-sm font-bold text-indigo-200 dark:text-indigo-100 uppercase tracking-wider mb-4">Utilidad Neta</p>
              <h3 className="text-4xl font-black">{formatCurrency(data.utilidadNeta)}</h3>
              <p className="text-xs font-medium text-indigo-200 dark:text-indigo-100 mt-2">Ganancia real (Ventas - Costos)</p>
            </div>
          </div>

          {/* 2. RANKINGS Y LISTAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Mejores Vendedores */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center transition-colors">
                <Award className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" />
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Top Vendedores</h3>
              </div>
              <div className="p-5 flex-1 overflow-auto custom-scrollbar">
                {data.rankingVendedores.length > 0 ? (
                  <ul className="space-y-4">
                    {data.rankingVendedores.map((vendedor, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vendedor.nombreVendedor}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(vendedor.totalVendido)}</p>
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{vendedor.cantidadOperaciones} ventas</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-bold text-center mt-4">No hay datos en este rango.</p>
                )}
              </div>
            </div>

            {/* Mejores Clientes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center transition-colors">
                <Users className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Clientes VIP</h3>
              </div>
              <div className="p-5 flex-1 overflow-auto custom-scrollbar">
                {data.rankingClientes.length > 0 ? (
                  <ul className="space-y-4">
                    {data.rankingClientes.map((cliente) => (
                      <li key={cliente.id} className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-40">{cliente.nombre}</span>
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{cliente.documento}</span>
                        </div>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-md border border-transparent dark:border-indigo-900/20">
                          {formatCurrency(cliente.monto)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-bold text-center mt-4">No hay clientes VIP aún.</p>
                )}
              </div>
            </div>

            {/* Deudores */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-rose-200 dark:border-rose-900/40 flex flex-col transition-colors">
              <div className="p-5 border-b border-rose-100 dark:border-rose-900/40 flex items-center bg-rose-50/50 dark:bg-rose-950/20 rounded-t-2xl transition-colors">
                <UserMinus className="w-5 h-5 mr-2 text-rose-600 dark:text-rose-400" />
                <h3 className="text-lg font-black text-rose-800 dark:text-rose-200">Deudores Activos</h3>
              </div>
              <div className="p-5 flex-1 overflow-auto custom-scrollbar">
                {data.listaDeudores.length > 0 ? (
                  <ul className="space-y-4">
                    {data.listaDeudores.map((deudor) => (
                      <li key={deudor.id} className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate w-40">{deudor.nombre}</span>
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{deudor.documento}</span>
                        </div>
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                          - {formatCurrency(deudor.monto)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-500 dark:text-emerald-400 font-bold text-center mt-4">¡Excelente! No hay clientes con deudas.</p>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};