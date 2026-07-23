import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, ChevronDown, Pin, LogOut } from 'lucide-react';
import { navigationSections, type NavAccordion, type NavSingleLink } from './navigation.data';

interface MainSidebarProps {
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MainSidebar = ({ user, logout, isOpen, onClose }: MainSidebarProps) => {
  const location = useLocation();
  const isAdmin = user?.rol === 'ROLE_ADMIN';

  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('vantix_sidebar_pinned');
    return saved ? JSON.parse(saved) : true;
  });

  // Estado unificado para saber qué acordeón está abierto
  const [openAccordion, setOpenAccordion] = useState<string | null>(() => {
    if (location.pathname.startsWith('/inventory')) return 'inventory';
    if (location.pathname.startsWith('/finances')) return 'finances';
    if (location.pathname.startsWith('/compras')) return 'purchases';
    if (location.pathname.startsWith('/history')) return 'history';
    if (location.pathname.startsWith('/ecommerce')) return 'ecommerce';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return null;
  });

  useEffect(() => {
    localStorage.setItem('vantix_sidebar_pinned', JSON.stringify(isPinned));
    window.dispatchEvent(new Event('resize'));
  }, [isPinned]);

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => (prev === id ? null : id));
  };

  const renderSingleLink = (link: NavSingleLink) => {
    if (link.adminOnly && !isAdmin) return null;
    const Icon = link.icon;
    return (
      <NavLink
        key={link.path}
        to={link.path}
        onClick={handleMobileNavClick}
        className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg transition-all font-medium overflow-hidden ${
          isActive 
            ? 'bg-blue-50 dark:bg-slate-800 text-primary dark:text-blue-400 shadow-xs' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Icon className="w-5 h-5 mr-3 shrink-0" />
        <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>
          {link.name}
        </span>
      </NavLink>
    );
  };

  const renderAccordion = (acc: NavAccordion) => {
    if (acc.adminOnly && !isAdmin) return null;
    const Icon = acc.icon;
    const isOpen = openAccordion === acc.id;
    const isActiveParent = location.pathname.startsWith(acc.basePath);

    return (
      <div key={acc.id}>
        <button
          type="button"
          onClick={() => toggleAccordion(acc.id)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium overflow-hidden outline-hidden cursor-pointer ${
            isActiveParent
              ? 'bg-slate-100/80 dark:bg-slate-800/60 text-primary dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center min-w-0">
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>
              {acc.title}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'} ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`mt-1 space-y-1 duration-200 ${isPinned ? 'block' : 'lg:hidden lg:group-hover:block'}`}>
            {acc.items.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  end={sub.exact}
                  onClick={handleMobileNavClick}
                  className={({ isActive }) => `flex items-center pl-8 pr-3 py-2 rounded-lg text-xs font-bold transition-all overflow-hidden ${
                    isActive
                      ? 'bg-blue-50/60 dark:bg-slate-800 text-primary dark:text-blue-400 border-l-2 border-primary dark:border-blue-500 rounded-l-none'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <SubIcon className="w-4 h-4 mr-2.5 shrink-0 opacity-80" />
                  <span className={`truncate transition-all duration-300 ${isPinned ? 'opacity-100 visible' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible'}`}>
                    {sub.name}
                  </span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-lg flex flex-col transition-all duration-300 ease-in-out group delay-75 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isPinned ? 'w-64 lg:absolute' : 'w-64 lg:w-20 lg:hover:w-64 lg:absolute'}`}>
      
      {/* HEADER */}
      <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-5 bg-primary shrink-0">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm">VX</span>
          </div>
          <h1 className={`text-base font-black text-white tracking-widest uppercase truncate transition-all duration-300 ${isPinned ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
            Vantix POS
          </h1>
        </div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`hidden lg:flex p-1.5 rounded-md transition-colors outline-hidden ${isPinned ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10 opacity-0 lg:group-hover:opacity-100'}`}
          >
            <Pin className={`w-4 h-4 transition-transform duration-200 ${isPinned ? 'rotate-45' : ''}`} />
          </button>
          <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-md lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* NAV CON TÍTULOS DE SECCIÓN */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar overflow-x-hidden">
        {navigationSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {sec.sectionTitle && (
              <div className={`px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-all duration-300 ${isPinned ? 'opacity-100 block' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
                {sec.sectionTitle}
              </div>
            )}
            {sec.links?.map(renderSingleLink)}
            {sec.accordions?.map(renderAccordion)}
          </div>
        ))}
      </nav>

      {/* FOOTER USER */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col truncate pr-2 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:invisible lg:group-hover:visible">
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-xs">{user?.nombre || 'Usuario'}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isAdmin ? 'Administrador' : 'Cajero'}</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};