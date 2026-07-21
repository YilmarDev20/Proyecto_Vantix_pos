import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Banknote,
  ShoppingBag, Users, ReceiptText, BarChart3, ShieldCheck, 
  Settings, LogOut, X, ChevronDown, Tag, Layers, ArrowLeftRight, Pin,
  Wallet, History, Landmark, Truck, CreditCard, Receipt, FileText,
  TrendingUp, Building2, Store
} from 'lucide-react';

interface MainSidebarProps {
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MainSidebar = ({ user, logout, isOpen, onClose }: MainSidebarProps) => {
  const location = useLocation();
  const isAdmin = user?.rol === 'ROLE_ADMIN';
  
  // Control de menú fijo/estático persistente
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('vantix_sidebar_pinned');
    return saved ? JSON.parse(saved) : true;
  });

  // 🚀 Estados de apertura para cada acordeón del sistema
  const [isInventoryOpen, setIsInventoryOpen] = useState(() => location.pathname.startsWith('/inventory'));
  const [isFinancesOpen, setIsFinancesOpen] = useState(() => location.pathname.startsWith('/finances'));
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(() => location.pathname.startsWith('/compras'));
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => location.pathname.startsWith('/history'));
  const [isReportsOpen, setIsReportsOpen] = useState(() => location.pathname.startsWith('/reports'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => location.pathname.startsWith('/settings'));

  useEffect(() => {
    localStorage.setItem('vantix_sidebar_pinned', JSON.stringify(isPinned));
    window.dispatchEvent(new Event('resize'));
  }, [isPinned]);

  useEffect(() => {
    // Sincroniza de forma limpia la pestaña activa cerrando las demás
    setIsInventoryOpen(location.pathname.startsWith('/inventory'));
    setIsFinancesOpen(location.pathname.startsWith('/finances'));
    setIsPurchasesOpen(location.pathname.startsWith('/compras'));
    setIsHistoryOpen(location.pathname.startsWith('/history'));
    setIsReportsOpen(location.pathname.startsWith('/reports'));
    setIsSettingsOpen(location.pathname.startsWith('/settings'));
  }, [location.pathname]);

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const inventorySubItems = [
    { name: 'Catálogo Base', path: '/inventory', icon: Package },
    { name: 'Imprimir Etiquetas', path: '/inventory/labels', icon: Tag },
    { name: 'Familias y Categorías', path: '/inventory/categories', icon: Layers },
    { name: 'Kardex (Movimientos)', path: '/inventory/kardex', icon: ReceiptText },
    { name: 'Traslados', path: '/inventory/transfers', icon: ArrowLeftRight },
  ];

  const financesSubItems = [
    { name: 'Caja Operativa', path: '/finances', icon: Wallet },
    ...(isAdmin ? [{ name: 'Historial de Turnos', path: '/finances/history', icon: History }] : []),
    { name: isAdmin ? 'Efectivo Global' : 'Mis Movimientos', path: '/finances/flow', icon: Landmark },
  ];

  const purchasesSubItems = [
    { name: 'Proveedores', path: '/compras', icon: Truck },
    { name: 'Registro de Compras', path: '/compras/history', icon: ShoppingCart },
    { name: 'Cuentas por Pagar', path: '/compras/payables', icon: CreditCard },
  ];

  const historySubItems = [
    { name: 'Ventas Reales', path: '/history', icon: Receipt },
    { name: 'Cotizaciones', path: '/history/quotes', icon: FileText },
  ];

  // 🚀 Sub-items del acordeón de Reportes
  const reportsSubItems = [
    { name: 'Ventas y Rentabilidad', path: '/reports/sales', icon: TrendingUp },
    { name: 'Inventario Predictivo', path: '/reports/inventory', icon: Package },
    { name: 'Finanzas y Caja', path: '/reports/finances', icon: Banknote },
    { name: 'Compras y Deudas', path: '/reports/purchases', icon: ShoppingBag },
  ];

  // 🚀 Sub-items del acordeón de Configuración
  const settingsSubItems = [
    { name: 'Formatos y Empresa', path: '/settings', icon: Building2 },
    { name: 'Sucursales (Tiendas)', path: '/settings/stores', icon: Store },
    { name: 'Usuarios y Roles', path: '/settings/users', icon: Users },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-lg flex flex-col 
      transition-all duration-300 ease-in-out group delay-75
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isPinned ? 'w-64 lg:absolute' : 'w-64 lg:w-20 lg:hover:w-64 lg:absolute'}
    `}>
      {/* HEADER SIDEBAR */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-5 bg-primary shrink-0 transition-all duration-300">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm">VX</span>
          </div>
          <h1 className={`text-base font-black text-white tracking-widest uppercase truncate transition-all duration-300
            ${isPinned ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}
          `}>
            Vantix POS
          </h1>
        </div>

        {/* BOTÓN PIN */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`hidden lg:flex p-1.5 rounded-md transition-colors outline-none
              ${isPinned ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10 opacity-0 lg:group-hover:opacity-100'}`}
            title={isPinned ? "Desfijar barra lateral" : "Fijar barra lateral permanentemente"}
          >
            <Pin className={`w-4 h-4 transition-transform duration-200 ${isPinned ? 'rotate-45' : ''}`} />
          </button>
          <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-md lg:hidden transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar overflow-x-hidden">
        
        {/* DASHBOARD */}
        {isAdmin && (
          <NavLink to="/" onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center px-3 py-3 rounded-lg transition-all font-medium overflow-hidden ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <LayoutDashboard className="w-5 h-5 mr-4 shrink-0 transition-colors" />
            <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Dashboard</span>
          </NavLink>
        )}

        {/* PUNTO DE VENTA */}
        <NavLink to="/pos" onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center px-3 py-3 rounded-lg transition-all font-medium overflow-hidden ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
          <ShoppingCart className="w-5 h-5 mr-4 shrink-0 transition-colors" />
          <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Punto de Venta</span>
        </NavLink>

        {/* ACORDEÓN: INVENTARIO */}
        <div>
          <button type="button" onClick={() => setIsInventoryOpen(!isInventoryOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/inventory') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <div className="flex items-center min-w-0">
              <Package className="w-5 h-5 mr-4 shrink-0 transition-colors" />
              <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Inventario</span>
            </div>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isInventoryOpen ? 'rotate-180' : ''}`} />
          </button>
          {isInventoryOpen && (
            <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
              {inventorySubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <NavLink key={subItem.path} to={subItem.path} end={subItem.path === '/inventory'} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                    <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* ACORDEÓN: CAJA Y FINANZAS */}
        <div>
          <button type="button" onClick={() => setIsFinancesOpen(!isFinancesOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/finances') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <div className="flex items-center min-w-0">
              <Banknote className="w-5 h-5 mr-4 shrink-0 transition-colors" />
              <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Caja y Finanzas</span>
            </div>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isFinancesOpen ? 'rotate-180' : ''}`} />
          </button>
          {isFinancesOpen && (
            <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
              {financesSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <NavLink key={subItem.path} to={subItem.path} end={subItem.path === '/finances'} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                    <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* ACORDEÓN: COMPRAS */}
        {isAdmin && (
          <div>
            <button type="button" onClick={() => setIsPurchasesOpen(!isPurchasesOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/compras') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <div className="flex items-center min-w-0">
                <ShoppingBag className="w-5 h-5 mr-4 shrink-0 transition-colors" />
                <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Compras</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isPurchasesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isPurchasesOpen && (
              <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
                {purchasesSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink key={subItem.path} to={subItem.path} end={subItem.path === '/compras'} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                      <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CLIENTES */}
        <NavLink to="/customers" onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center px-3 py-3 rounded-lg transition-all font-medium overflow-hidden ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
          <Users className="w-5 h-5 mr-4 shrink-0 transition-colors" />
          <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Clientes</span>
        </NavLink>

        {/* ACORDEÓN: HISTORIAL */}
        <div>
          <button type="button" onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/history') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <div className="flex items-center min-w-0">
              <ReceiptText className="w-5 h-5 mr-4 shrink-0 transition-colors" />
              <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Historial</span>
            </div>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isHistoryOpen ? 'rotate-180' : ''}`} />
          </button>
          {isHistoryOpen && (
            <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
              {historySubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                return (
                  <NavLink key={subItem.path} to={subItem.path} end={subItem.path === '/history'} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                    <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* 🚀 ACORDEÓN DESPLEGABLE: REPORTES (Solo Admin) */}
        {isAdmin && (
          <div>
            <button type="button" onClick={() => setIsReportsOpen(!isReportsOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/reports') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <div className="flex items-center min-w-0">
                <BarChart3 className="w-5 h-5 mr-4 shrink-0 transition-colors" />
                <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Reportes</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isReportsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isReportsOpen && (
              <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
                {reportsSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink key={subItem.path} to={subItem.path} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                      <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AUDITORÍA */}
        {isAdmin && (
          <NavLink to="/audit" onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center px-3 py-3 rounded-lg transition-all font-medium overflow-hidden ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <ShieldCheck className="w-5 h-5 mr-4 shrink-0 transition-colors" />
            <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Auditoría</span>
          </NavLink>
        )}

        {/* 🚀 ACORDEÓN DESPLEGABLE: CONFIGURACIÓN (Solo Admin) */}
        {isAdmin && (
          <div>
            <button type="button" onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all font-medium overflow-hidden outline-none ${location.pathname.startsWith('/settings') ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <div className="flex items-center min-w-0">
                <Settings className="w-5 h-5 mr-4 shrink-0 transition-colors" />
                <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>Configuración</span>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSettingsOpen && (
              <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
                {settingsSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  return (
                    <NavLink key={subItem.path} to={subItem.path} end={subItem.path === '/settings'} onClick={handleMobileNavClick} className={({ isActive }) => `flex items-center pl-9 pr-3 py-2.5 rounded-lg text-xs font-bold transition-all overflow-hidden ${isActive ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <SubIcon className="w-4 h-4 mr-3 shrink-0 opacity-80" />
                      <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>{subItem.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* FOOTER USER PERFIL */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex flex-col truncate pr-2 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible">
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate" title={user?.nombre}>{user?.nombre || 'Usuario'}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{isAdmin ? 'Administrador' : 'Cajero'}</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-lg transition-colors shrink-0" title="Cerrar Sesión">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};