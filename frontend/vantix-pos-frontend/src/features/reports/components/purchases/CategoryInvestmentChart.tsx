import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { PackageSearch } from 'lucide-react';
import type { InversionCategoria } from '../../types/purchases.types';

interface Props {
  data: InversionCategoria[];
}

export const CategoryInvestmentChart = ({ data }: Props) => {
  const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors">
      <div className="flex items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
        <PackageSearch className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 transition-colors">Inversión por Categorías</h3>
      </div>
      
      {data.length > 0 ? (
        <div className="flex-1 min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={data} 
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#1e293b' : '#f1f5f9'} />
              <XAxis type="number" tickFormatter={(val) => `S/ ${val}`} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="categoria" type="category" width={100} tick={{ fontSize: 11, fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a'
                }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Total Invertido']}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={32}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center transition-colors">
          <p>No hay compras registradas en este periodo para graficar.</p>
        </div>
      )}
    </div>
  );
};