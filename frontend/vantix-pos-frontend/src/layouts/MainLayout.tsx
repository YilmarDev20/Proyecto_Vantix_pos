import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { useAuth } from '@/core/auth/context/AuthContext';
import { useStore } from '@/core/store/context/StoreContext';

import { MainSidebar } from './components/MainSidebar';
import { MainTopbar } from './components/MainTopbar';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { activeStoreId, activeStoreName, stores, changeActiveStore } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  // Escuchamos los cambios en LocalStorage o eventos manuales para ajustar el margen lateral
  useEffect(() => {
    const checkPinnedStatus = () => {
      const saved = localStorage.getItem('vantix_sidebar_pinned');
      setIsSidebarPinned(saved ? JSON.parse(saved) : true);
    };

    checkPinnedStatus(); // Carga inicial
    
    // Escucha de reajuste de interfaz
    window.addEventListener('resize', checkPinnedStatus);
    return () => window.removeEventListener('resize', checkPinnedStatus);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <MainSidebar 
        user={user}
        logout={logout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 🚀 COMPENSACIÓN EN VIVO: Si está anclado da pl-64, si es flotante da pl-20 */}
      <main className={`flex-1 flex flex-col h-screen w-full overflow-hidden relative transition-all duration-300
        ${isSidebarPinned ? 'lg:pl-64' : 'lg:pl-20'}
      `}>
        
        <MainTopbar 
          user={user}
          activeStoreId={activeStoreId}
          activeStoreName={activeStoreName}
          stores={stores}
          changeActiveStore={changeActiveStore}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 bg-slate-50/50 dark:bg-slate-950/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};