import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/core/auth/context/AuthContext';
import { StoreService } from '@/features/settings/services/settings.api';
import type { Store } from '@/features/settings/types/settings.types';

interface StoreContextType {
  activeStoreId: number | null; // null significa "Todas las tiendas (Global)"
  activeStoreName: string;
  stores: Store[];
  changeActiveStore: (storeId: number | null) => void;
  isLoadingStores: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null);
  const [activeStoreName, setActiveStoreName] = useState<string>('Cargando...');
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  // Cargar tiendas y definir la tienda por defecto al loguearse
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchStores = async () => {
        setIsLoadingStores(true);
        try {
          // Cargamos todas las tiendas activas
          const allStores = await StoreService.getAll();
          const activeOnly = allStores.filter(s => s.estado);
          setStores(activeOnly);

          // Si es Cajero, LO OBLIGAMOS a quedarse en su tienda base
          if (user.rol === 'ROLE_SELLER') {
            setActiveStoreId(user.tiendaId);
            setActiveStoreName(user.tiendaNombre);
            // Limpiamos la memoria por si antes entró un admin en esta PC
            localStorage.removeItem('vantix_active_store_id');
            localStorage.removeItem('vantix_active_store_name');
          } 
          // ---> MAGIA: Si es Admin, recuperamos su última tienda visitada <---
          else if (user.rol === 'ROLE_ADMIN') {
             const savedStoreId = localStorage.getItem('vantix_active_store_id');
             const savedStoreName = localStorage.getItem('vantix_active_store_name');

             // Si hay algo guardado (ojo: "null" como texto es Visión Global)
             if (savedStoreId !== null) {
               setActiveStoreId(savedStoreId === "null" ? null : Number(savedStoreId));
               setActiveStoreName(savedStoreName || 'Visión Global');
             } else {
               // Si es su primera vez, por defecto lo ponemos en modo GLOBAL
               setActiveStoreId(null);
               setActiveStoreName('Visión Global');
             }
          }
        } catch (error) {
          console.error("Error al cargar tiendas", error);
        } finally {
          setIsLoadingStores(false);
        }
      };
      fetchStores();
    }
  }, [isAuthenticated, user]);

  const changeActiveStore = (storeId: number | null) => {
    if (user?.rol !== 'ROLE_ADMIN') return; // Bloqueo de seguridad anti-hackers
    
    setActiveStoreId(storeId);
    let newName = 'Visión Global';

    if (storeId === null) {
      newName = 'Visión Global';
    } else {
      const selected = stores.find(s => s.id === storeId);
      newName = selected?.nombre || 'Desconocida';
    }

    setActiveStoreName(newName);

    // ---> MAGIA: Guardamos la elección en el disco del navegador <---
    localStorage.setItem('vantix_active_store_id', String(storeId));
    localStorage.setItem('vantix_active_store_name', newName);
  };

  return (
    <StoreContext.Provider value={{ activeStoreId, activeStoreName, stores, changeActiveStore, isLoadingStores }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de un StoreProvider');
  return context;
};