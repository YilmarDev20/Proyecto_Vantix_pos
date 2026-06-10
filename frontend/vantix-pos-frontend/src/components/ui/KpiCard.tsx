import type { ElementType } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: number; // Ej: +5% o -2%
  trendText?: string; // Ej: "vs mes anterior"
  colorClass?: string; // Ej: "text-blue-500 bg-blue-100"
}

export const KpiCard = ({ title, value, icon: Icon, trend, trendText, colorClass = "text-primary bg-blue-50" }: KpiCardProps) => {
  return (
    // ✅ ADAPTACIÓN: Fondo de tarjeta, bordes y sombras para modo oscuro con transiciones suaves
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex flex-col transition-colors">
      <div className="flex justify-between items-start mb-4">
        {/* ✅ ADAPTACIÓN: Color del título secundario */}
        <h4 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h4>
        
        {/* El contenedor del ícono mantendrá sus clases dinámicas (o las pasadas por props como bg-orange-950/20) */}
        <div className={`p-2 rounded-lg transition-colors ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto">
        {/* ✅ ADAPTACIÓN: Color del valor numérico principal */}
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{value}</h2>
        
        {/* Mostrar la tendencia solo si existe */}
        {trend !== undefined && (
          <div className="flex items-center mt-2 text-sm">
            {/* Las tendencias numéricas ya cuentan con colores con buen contraste en oscuro (green-500 / red-500) */}
            <span className={`font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {/* ✅ ADAPTACIÓN: Color de la etiqueta aclaratoria de la tendencia */}
            {trendText && <span className="text-slate-400 dark:text-slate-500 ml-2 transition-colors">{trendText}</span>}
          </div>
        )}
      </div>
    </div>
  );
};