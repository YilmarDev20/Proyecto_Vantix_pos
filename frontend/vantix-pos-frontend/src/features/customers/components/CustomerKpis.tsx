import { Users, UserCheck, CreditCard } from 'lucide-react';
import type { Customer } from '../types/customer.types';
import { KpiCard } from '@/components/ui/KpiCard';

interface CustomerKpisProps {
  customers: Customer[];
}

export const CustomerKpis = ({ customers }: CustomerKpisProps) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.estado).length;
  const totalDebt = customers.reduce((sum, current) => sum + current.deudaActual, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <KpiCard 
        title="Total Registrados" 
        value={totalCustomers} 
        icon={Users} 
        colorClass="text-blue-600 bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400"
      />
      <KpiCard 
        title="Clientes Activos" 
        value={activeCustomers} 
        icon={UserCheck} 
        colorClass="text-green-600 bg-green-100 dark:bg-green-950/20 dark:text-green-400"
      />
      <KpiCard 
        title="Deuda en la Calle" 
        value={`S/ ${totalDebt.toFixed(2)}`} 
        icon={CreditCard} 
        colorClass="text-orange-600 bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400"
      />
    </div>
  );
};