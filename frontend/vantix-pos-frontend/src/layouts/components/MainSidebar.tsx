import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, /*Tag*/ Banknote,
  ShoppingBag, Users, ReceiptText, BarChart3, ShieldCheck, 
  Settings, LogOut, X 
} from 'lucide-react';

interface MainSidebarProps {
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MainSidebar = ({ user, logout, isOpen, onClose }: MainSidebarProps) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Punto de Venta', path: '/pos', icon: ShoppingCart },
    { name: 'Inventario', path: '/inventory', icon: Package },
    //{ name: 'Promociones', path: '/promotions', icon: Tag },
    { name: 'Caja y Finanzas', path: '/finances', icon: Banknote },
    { name: 'Compras', path: '/compras', icon: ShoppingBag },
    { name: 'Clientes', path: '/customers', icon: Users },
    { name: 'Historial', path: '/history', icon: ReceiptText },
    { name: 'Reportes', path: '/reports', icon: BarChart3 },     
    { name: 'Auditoría', path: '/audit', icon: ShieldCheck },
    { name: 'Configuración', path: '/settings', icon: Settings },
  ];

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-2xl lg:shadow-none flex flex-col 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* HEADER SIDEBAR */}
      <div className="h-14 lg:h-16 flex items-center justify-between lg:justify-center px-4 lg:px-0 bg-primary shrink-0">
        <h1 className="text-lg lg:text-xl font-black text-white tracking-widest uppercase">Vantix POS</h1>
        <button 
          onClick={onClose}
          className="p-1 text-white hover:bg-white/20 rounded-md lg:hidden transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* CUERPO DE ENLACES */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (user?.rol === 'ROLE_SELLER' && ['/', '/compras', '/reports', '/audit', '/settings'].includes(item.path)) {
            return null; 
          }

          return (
            <NavLink
              key={item.name} 
              to={item.path}
              onClick={handleMobileNavClick}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER USER PERFIL */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col truncate pr-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={user?.nombre}>
              {user?.nombre || 'Usuario'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {user?.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Cajero'}
            </span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-lg transition-colors shrink-0" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};