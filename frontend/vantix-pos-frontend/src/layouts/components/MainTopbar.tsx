import { useState, useEffect } from 'react';
import { Menu, Store, ShieldAlert, Bell, Sun, Moon } from 'lucide-react';
import { SecurityService } from '@/core/auth/services/security.api';
import { useTheme } from '@/core/theme/context/ThemeContext';

interface MainTopbarProps {
  user: any;
  activeStoreId: number | null;
  activeStoreName: string;
  stores: any[];
  changeActiveStore: (id: number | null) => void;
  onOpenMobileMenu: () => void;
}

export const MainTopbar = ({
  user,
  activeStoreId,
  activeStoreName,
  stores,
  changeActiveStore,
  onOpenMobileMenu
}: MainTopbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [pinData, setPinData] = useState<{ pin: string; timeLeft: number } | null>(null);

  useEffect(() => {
    if (user?.rol !== 'ROLE_ADMIN') return;

    const fetchPin = async () => {
      try {
        const data = await SecurityService.getAdminPin();
        setPinData({ pin: data.pinActual, timeLeft: data.segundosRestantes });
      } catch (error) {
        console.error("Error al obtener PIN de seguridad");
      }
    };

    fetchPin(); 

    const countdown = setInterval(() => {
      setPinData((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          fetchPin(); 
          return prev; 
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [user]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <header className="h-14 shrink-0 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 lg:px-6 z-10 transition-colors duration-200">
      
      <div className="flex items-center space-x-2 lg:space-x-4">
        <button 
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors lg:hidden shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* SELECTOR DE TIENDA */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700/80 max-w-[140px] sm:max-w-xs">
          <Store className="w-3.5 h-3.5 text-primary dark:text-blue-400 mr-1.5 shrink-0" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mr-2 hidden sm:inline shrink-0">Tienda:</span>
          
          {user?.rol === 'ROLE_ADMIN' ? (
            <select 
              value={activeStoreId === null ? 'GLOBAL' : activeStoreId}
              onChange={(e) => changeActiveStore(e.target.value === 'GLOBAL' ? null : Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-primary dark:text-blue-400 outline-none cursor-pointer truncate w-full"
            >
              <option value="GLOBAL" className="dark:bg-slate-900 dark:text-white">🌐 Visión Global</option>
              <hr />
              {stores.map(s => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900 dark:text-white">{s.nombre}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-bold text-primary dark:text-blue-400 truncate">{activeStoreName}</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        
        {/* WIDGET DEL PIN */}
        {user?.rol === 'ROLE_ADMIN' && pinData && (
          <div className="hidden sm:flex items-center bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-md shadow-sm shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 mr-1.5" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mr-2 mt-px">PIN:</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-widest mr-1.5">{pinData.pin}</span>
            <span className={`text-[10px] font-bold mt-px ${pinData.timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
              ({formatTimeLeft(pinData.timeLeft)})
            </span>
          </div>
        )}

        {/* RELOJ */}
        <div className="hidden md:flex flex-col items-end leading-none justify-center shrink-0">
           <span className="text-[10px] font-bold text-slate-400 capitalize mb-0.5">
             {time.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
           </span>
           <span className="text-xs font-black text-slate-700 dark:text-slate-300">
             {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
           </span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0"></div>

        {/* ACCIONES Y SWITCH DE TEMA */}
        <div className="flex items-center space-x-1 shrink-0">
          <button type="button" className="p-1.5 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors relative" title="Notificaciones">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
          
          <button 
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500 hover:text-primary" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};