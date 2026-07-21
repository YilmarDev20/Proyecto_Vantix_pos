import { useState, useEffect } from 'react';
import { Store, Plus, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '../../../core/auth/context/AuthContext';
import { DashboardService } from '../services/dashboard.api';
import type { DashboardResumen } from '../types/dashboard.types';

import { DashboardMessage } from '../components/DashboardMessage';
import { DashboardKpiCards } from '../components/DashboardKpiCards';
import { DashboardAlerts } from '../components/DashboardAlerts';
import { DashboardRankings } from '../components/DashboardRankings';
import { DashboardHourlyChart } from '../components/DashboardHourlyChart';

export const DashboardView = () => {
  const { activeStoreId, activeStoreName } = useStore();
  const { user } = useAuth(); // 🚀 Extraemos el usuario logueado
  const navigate = useNavigate();
  
  const [data, setData] = useState<DashboardResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rango, setRango] = useState<'HOY' | 'MES'>('HOY');

  // 🚀 ALERTA DE TIENDA ACTIVA DE ALTA VISIBILIDAD PARA EL ADMINISTRADOR
  useEffect(() => {
    // Si no está cargando, el usuario es ADMIN y no se ha mostrado este aviso en la sesión actual
    if (!isLoading && user?.rol === 'ROLE_ADMIN' && !sessionStorage.getItem('hasShownWelcomeStore')) {
      const tiendaActualText = activeStoreId ? activeStoreName : 'VISIÓN GLOBAL';
      
      toast.custom((t) => (
        <div className="w-full max-w-md bg-amber-50 dark:bg-slate-900 border-2 border-amber-500 rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide">
              ¡ATENCIÓN ADMINISTRADOR!
            </h4>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
              Estás operando en la sucursal: <span className="underline decoration-2 text-amber-600 dark:text-amber-400 font-extrabold">{tiendaActualText}</span>.
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Si no estás físicamente en este local, cámbiate de tienda en el menú superior inmediatamente para evitar perjudicar el stock.
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
            type="button"
          >
            Entendido
          </button>
        </div>
      ), {
        duration: 4000, // Se queda visible en pantalla por 4 segundos
        position: 'top-center' // Sale arriba al centro para máxima visualización
      });

      // Marcamos que ya se mostró para que no sea molesto al navegar
      sessionStorage.setItem('hasShownWelcomeStore', 'true');
    }
  }, [isLoading, user, activeStoreId, activeStoreName]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const result = await DashboardService.getResumenHoy(activeStoreId, rango);
        setData(result);
      } catch (error) {
        toast.error('Error al cargar el resumen del dashboard operativo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [activeStoreId, rango]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="text-slate-500 dark:text-slate-400 font-bold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Sincronizando operaciones ({rango === 'HOY' ? 'Día actual' : 'Mes actual'})...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 p-6 pb-20 max-w-7xl mx-auto w-full">
      
      {/* 1. CABECERA CON ACCIONES RÁPIDAS Y FILTRO ELEVADO */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center">
            <Store className="w-7 h-7 mr-3 text-indigo-600 dark:text-indigo-400" />
            Centro de Operaciones
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Gestión en tiempo real para: <strong className="text-indigo-600 dark:text-indigo-400">{activeStoreId ? activeStoreName : 'Visión Global'}</strong>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 mr-2 transition-colors">
            <button 
              type="button"
              onClick={() => setRango('HOY')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                rango === 'HOY' 
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Hoy
            </button>
            <button 
              type="button"
              onClick={() => setRango('MES')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                rango === 'MES' 
                  ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Este Mes
            </button>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/finances')}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" />
            Movimiento Caja
          </button>
          <button 
            type="button"
            onClick={() => navigate('/pos')}
            className="flex items-center px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* 2. TABLÓN DE ANUNCIOS */}
      <DashboardMessage mensaje={data.mensajeDelDia} />

      {/* 3. TARJETAS KPI */}
      <DashboardKpiCards data={data} />

      {/* 4. BLOQUE DIVIDIDO: ALERTAS, GRÁFICO DE DEMANDA Y RANKINGS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Izquierda: Alertas críticas de turnos */}
        <div className="xl:col-span-1 h-full">
          <DashboardAlerts data={data} />
        </div>

        {/* Derecha: Gráfica y Rankings */}
        <div className="xl:col-span-2 flex flex-col gap-6 h-full">
          <DashboardHourlyChart data={data.ventasPorHora} />
          <DashboardRankings data={data} />
        </div>

      </div>

    </div>
  );
};