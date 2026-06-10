import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import type { VentasPorHora } from '../types/dashboard.types';
import { useTheme } from '@/core/theme/context/ThemeContext'; // ✅ IMPORTANTE: Consumimos el estado del tema para Recharts

interface Props {
  data: VentasPorHora[];
}

export const DashboardHourlyChart = ({ data }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;
  
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12} ${ampm}`;
  };

  const chartData = data.map(item => ({
    ...item,
    horaFormat: formatHour(item.hora)
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors duration-200">
      <div className="flex items-center mb-6">
        <Activity className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Tráfico de Ventas por Hora (Hoy)</h3>
      </div>
      
      {chartData.length > 0 ? (
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {/* ✅ MODIFICACIÓN DINÁMICA: Ajusta las grillas y textos internos de la gráfica en tiempo real */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
              <XAxis dataKey="horaFormat" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `S/ ${val}`} />
              <Tooltip 
                cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1e293b' : '#ffffff', 
                  color: isDark ? '#f8fafc' : '#0f172a',
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Ventas']}
                labelFormatter={(label) => `Hora: ${label}`}
              />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-sm">
          Aún no hay suficiente tráfico para graficar.
        </div>
      )}
    </div>
  );
};