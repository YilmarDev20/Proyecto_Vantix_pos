import { Calendar } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: (start?: string, end?: string) => void; 
  isLoading?: boolean;
}

export const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter, isLoading }: Props) => {
  
  const setQuickRange = (type: 'today' | 'thisMonth') => {
    const today = new Date();
    let newStart = '';
    let newEnd = today.toISOString().split('T')[0];

    if (type === 'today') {
      newStart = newEnd;
    } else if (type === 'thisMonth') {
      newStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    }
    
    onStartDateChange(newStart);
    onEndDateChange(newEnd);
    onFilter(newStart, newEnd);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 transition-colors">
      <div className="flex items-center text-slate-500 dark:text-slate-400 font-bold text-sm md:border-r border-slate-200 dark:border-slate-800 md:pr-4 w-full md:w-auto transition-colors">
        <Calendar className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        Filtrar por Fecha
      </div>
      
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-1 w-full md:w-auto">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Desde:</span>
          <input 
            type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Hasta:</span>
          <input 
            type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)}
            className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer transition-colors"
          />
        </div>

        <button 
          type="button"
          onClick={() => onFilter()} 
          disabled={isLoading}
          className="w-full sm:w-auto ml-0 sm:ml-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-sm border border-transparent"
        >
          {isLoading ? 'Calculando...' : 'Aplicar Filtro'}
        </button>
      </div>

      <div className="flex space-x-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-end transition-colors">
        <button type="button" onClick={() => setQuickRange('today')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-900/40 transition-colors">Hoy</button>
        <button type="button" onClick={() => setQuickRange('thisMonth')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-900/40 transition-colors">Este Mes</button>
      </div>
    </div>
  );
};