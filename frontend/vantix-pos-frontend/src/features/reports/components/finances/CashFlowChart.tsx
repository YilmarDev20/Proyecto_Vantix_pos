import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUpDown } from 'lucide-react';
import type { MovimientoDetalle } from '../../types/finances.types';

interface Props {
  movimientos: MovimientoDetalle[];
}

export const CashFlowChart = ({ movimientos }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  const procesarDatosPorDia = () => {
    const resumen: Record<string, { fecha: string; ingresos: number; egresos: number }> = {};
    const movimientosOrdenados = [...movimientos].reverse();

    movimientosOrdenados.forEach((mov) => {
      const dia = mov.fecha.split('T')[0]; 
      const dateObj = new Date(mov.fecha);
      const diaFormateado = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(dateObj);

      if (!resumen[dia]) {
        resumen[dia] = { fecha: diaFormateado, ingresos: 0, egresos: 0 };
      }

      if (mov.tipoMovimiento === 'INGRESO') {
        resumen[dia].ingresos += mov.monto;
      } else {
        resumen[dia].egresos += mov.monto;
      }
    });

    return Object.values(resumen);
  };

  const data = procesarDatosPorDia();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
        <TrendingUpDown className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Flujo de Efectivo Diario</h3>
      </div>
      
      {data.length > 0 ? (
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* ✅ ADAPTACIÓN: Líneas de grilla adaptadas a gris sutil en oscuro */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
              <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(val) => `S/ ${val}`} />
              <Tooltip 
                cursor={{ fill: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                }}
                formatter={(value: any, name: any) => [formatCurrency(Number(value) || 0), String(name).toUpperCase()]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="egresos" name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <p>No hay datos suficientes para graficar.</p>
        </div>
      )}
    </div>
  );
};