import { Megaphone } from 'lucide-react';

interface Props {
  mensaje: string;
}

export const DashboardMessage = ({ mensaje }: Props) => {
  if (!mensaje) return null;

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex items-start sm:items-center animate-in fade-in slide-in-from-top-4 duration-500 transition-colors">
      <div className="bg-indigo-100 dark:bg-indigo-900/60 p-2 rounded-lg mr-4 shrink-0 shadow-sm transition-colors">
        <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider mb-0.5">Nota del Turno</h4>
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{mensaje}</p>
      </div>
    </div>
  );
};