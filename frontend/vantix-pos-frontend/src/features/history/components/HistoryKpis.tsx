import { TrendingUp, Receipt, FileText } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { useAuth } from '@/core/auth/context/AuthContext'; // ---> IMPORTAMOS EL CONTEXTO <---

interface HistoryKpisProps {
  cantidadVentas: number;
  totalIngresos: number;
  cantidadCotizaciones: number;
}

export const HistoryKpis = ({ cantidadVentas, totalIngresos, cantidadCotizaciones }: HistoryKpisProps) => {
  // ---> EXTRAEMOS EL USUARIO Y VERIFICAMOS SI ES ADMIN <---
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';

  return (
    // ---> MAGIA CSS: Si es Admin son 3 columnas, si es Cajero son 2 columnas <---
    <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
      
      {/* 🔒 ESTA TARJETA SOLO EXISTIRÁ SI EL USUARIO ES ADMIN */}
      {isAdmin && (
        <KpiCard 
          title="Total en Ventas (Completadas)" 
          value={`S/ ${totalIngresos.toFixed(2)}`} 
          icon={TrendingUp} 
          colorClass="text-emerald-500 bg-emerald-100" 
        />
      )}

      {/* ESTAS TARJETAS LAS VEN TODOS */}
      <KpiCard 
        title="Tickets Emitidos" 
        value={cantidadVentas} 
        icon={Receipt} 
        colorClass="text-blue-500 bg-blue-100" 
      />
      <KpiCard 
        title="Cotizaciones Pendientes" 
        value={cantidadCotizaciones} 
        icon={FileText} 
        colorClass="text-amber-500 bg-amber-100" 
      />
    </div>
  );
};