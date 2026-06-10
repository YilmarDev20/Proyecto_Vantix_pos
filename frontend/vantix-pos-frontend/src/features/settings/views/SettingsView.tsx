import { useState } from 'react';
import { Building2, Store, Users } from 'lucide-react';
import { CompanySettingsTab } from '../components/CompanySettingsTab';
import { StoreSettingsTab } from '../components/StoreSettingsTab';
import { UserSettingsTab } from '../components/UserSettingsTab';

type TabType = 'formatos' | 'sucursales' | 'usuarios';

export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<TabType>('formatos');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      {/* Header Principal */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">Configuración del Sistema</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Administra los datos fiscales, sucursales y accesos al sistema.</p>
      </div>

      {/* Navegación de Pestañas (Tabs) */}
      <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-fit mb-6 transition-colors overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('formatos')}
          className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap border border-transparent ${
            activeTab === 'formatos' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Formatos y Empresa
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sucursales')}
          className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap border border-transparent ${
            activeTab === 'sucursales' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4 mr-2" />
          Sucursales (Tiendas)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap border border-transparent ${
            activeTab === 'usuarios' 
              ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Usuarios y Roles
        </button>
      </div>

      {/* Contenedor Dinámico */}
      <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
        {activeTab === 'formatos' && <CompanySettingsTab />}
        {activeTab === 'sucursales' && <StoreSettingsTab />}
        {activeTab === 'usuarios' && <UserSettingsTab />}
      </div>
    </div>
  );
};