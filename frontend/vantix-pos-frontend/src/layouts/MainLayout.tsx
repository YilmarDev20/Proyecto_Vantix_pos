import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useAuth } from '@/core/auth/context/AuthContext';
import { useStore } from '@/core/store/context/StoreContext';

// Importamos los dos subcomponentes desacoplados
import { MainSidebar } from './components/MainSidebar';
import { MainTopbar } from './components/MainTopbar';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { activeStoreId, activeStoreName, stores, changeActiveStore } = useStore();

  // El único estado que conserva el armazón es el control de la hamburguesa móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* VELO OSCURO PARA DISPOSITIVOS MÓVILES */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* COMPONENTE MENÚ LATERAL (DESACOPLADO Y COLAPSABLE) */}
      <MainSidebar 
        user={user}
        logout={logout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* SECCIÓN DEL CONTENIDO PRINCIPAL (Con margen compensatorio de 80px en desktop para el menú colapsado) */}
      <main className="flex-1 flex flex-col h-screen w-full overflow-hidden relative lg:pl-20 transition-all duration-300">
        
        {/* COMPONENTE BARRA SUPERIOR (DESACOPLADO CON RELOJ Y MODO OSCURO) */}
        <MainTopbar 
          user={user}
          activeStoreId={activeStoreId}
          activeStoreName={activeStoreName}
          stores={stores}
          changeActiveStore={changeActiveStore}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* CONTENEDOR DE COMPONENTES DE RUTA DINÁMICOS */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 bg-slate-50/50 dark:bg-slate-950/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};