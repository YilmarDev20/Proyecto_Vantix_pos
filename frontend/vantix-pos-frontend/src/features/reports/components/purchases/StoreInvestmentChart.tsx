import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Store } from 'lucide-react';
import type { InversionTienda } from '../../types/purchases.types';

interface Props {
  data: InversionTienda[];
}

export const StoreInvestmentChart = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

  const chartData = data.map(item => ({
    ...item,
    nombreSucursal: `Sucursal ${item.tiendaId}`
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
        <Store className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Inversión por Sucursal</h3>
      </div>
      
      {chartData.length > 0 ? (
        <div className="flex-1 min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="nombreSucursal"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), 'Total Invertido']}
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
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center transition-colors">
          <p>No hay datos de inversión por sucursal.</p>
        </div>
      )}
    </div>
  );
};