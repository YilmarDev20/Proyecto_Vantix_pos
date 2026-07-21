import { useState, useEffect } from 'react';
import { CompanySettingsTab } from '../components/CompanySettingsTab';
import { StoreSettingsTab } from '../components/StoreSettingsTab';
import { UserSettingsTab } from '../components/UserSettingsTab';

interface SettingsViewProps {
  forcedTab?: 'formatos' | 'sucursales' | 'usuarios';
}

export const SettingsView = ({ forcedTab = 'formatos' }: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState<'formatos' | 'sucursales' | 'usuarios'>(forcedTab);

  // Mantiene sincronizado el estado si se navega directamente usando la barra lateral
  useEffect(() => {
    setActiveTab(forcedTab);
  }, [forcedTab]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      {/* Header Principal Limpio */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">
          Configuración: {
            activeTab === 'formatos' ? 'Formatos y Empresa' : 
            activeTab === 'sucursales' ? 'Sucursales (Tiendas)' : 'Usuarios y Roles'
          }
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          {activeTab === 'formatos' && 'Administra la razón social, RUC, direcciones fiscales y formato de tickets.'}
          {activeTab === 'sucursales' && 'Controla la creación de tiendas, almacenes físicos y asignación de stock.'}
          {activeTab === 'usuarios' && 'Gestión de credenciales de operadores, cajeros y permisos especiales del sistema.'}
        </p>
      </div>

      {/* Contenedor Dinámico Directo */}
      <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
        {activeTab === 'formatos' && <CompanySettingsTab />}
        {activeTab === 'sucursales' && <StoreSettingsTab />}
        {activeTab === 'usuarios' && <UserSettingsTab />}
      </div>
    </div>
  );
};