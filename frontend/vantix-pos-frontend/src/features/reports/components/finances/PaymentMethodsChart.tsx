import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CreditCard } from 'lucide-react';
import type { FlujoPago } from '../../types/finances.types';

interface Props {
  pagos: FlujoPago[];
}

export const PaymentMethodsChart = ({ pagos }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  const getPaymentColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'YAPE': return '#8b5cf6'; 
      case 'PLIN': return '#06b6d4'; 
      case 'EFECTIVO': return '#10b981'; 
      case 'TARJETA': return '#3b82f6'; 
      case 'TRANSFERENCIA': return '#f59e0b'; 
      default: return '#64748b'; 
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
        <CreditCard className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Distribución de Ingresos</h3>
      </div>
      
      {pagos.length > 0 ? (
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pagos}
                dataKey="totalMonto"
                nameKey="metodoPago"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pagos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPaymentColor(entry.metodoPago)} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [
                  formatCurrency(Number(value) || 0), 
                  "Total Recaudado"
                ]}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <p>No hay ingresos registrados en este rango de fechas.</p>
        </div>
      )}
    </div>
  );
};