import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/core/auth/context/AuthContext'; 
import { useStore } from '@/core/store/context/StoreContext';
import { Store } from 'lucide-react';

import { MainLayout } from '@/layouts/MainLayout';
import { LoginView } from '@/features/auth/views/LoginView'; 

import { CustomersView } from '@/features/customers/views/CustomersView';
import { CustomerProfileView } from '@/features/customers/views/CustomerProfileView';

// Módulo Inventario
import { ProductView } from '@/features/inventory/product/views/ProductView';
import { LabelPrintingView } from '@/features/inventory/labels/views/LabelPrintingView';
import { CategoryView } from '@/features/inventory/category/views/CategoryView';
import { KardexView } from '@/features/inventory/kardex/views/KardexView'; 
import { TransfersLayout } from '@/features/inventory/transfers/views/TransfersLayout';

// Módulo Finanzas
import { CashRegisterView } from '@/features/finances/views/CashRegisterView';
import { TurnHistoryView } from '@/features/finances/views/TurnHistoryView';
import { CashFlowView } from '@/features/finances/views/CashFlowView';

// Módulo Compras
import { SuppliersView } from '@/features/purchases/views/SuppliersView';
import { PurchaseHistoryView } from '@/features/purchases/views/PurchaseHistoryView';
import { AccountsPayableView } from '@/features/purchases/views/AccountsPayableView';

// Módulo Historial
import { TransactionHistoryView } from '@/features/history/views/TransactionHistoryView';

// 🚀 Módulo Reportes y Configuración distribuidos nativamente
import { ReportsLayout } from '@/features/reports/views/ReportsLayout';
import { ReporteVentasView } from '@/features/reports/views/ReporteVentasView';
import { ReporteInventarioView } from '@/features/reports/views/ReporteInventarioView';
import { ReporteFinanzasView } from '@/features/reports/views/ReporteFinanzasView';
import { ReporteComprasView } from '@/features/reports/views/ReporteComprasView';

import { SettingsView } from '@/features/settings/views/SettingsView';

import { ProductFormView } from '@/features/inventory/product/views/ProductFormView';
import { VariantManagerView } from '@/features/inventory/variant/views/VariantManagerView';
import { PosLayout } from '@/features/pos/views/PosLayout';
import { AuditView } from '@/features/audit/views/AuditView';
import { DashboardView } from '@/features/dashboard/views/DashboardView'; 

const GlobalModeGuard = () => {
  const { activeStoreId } = useStore();
  if (!activeStoreId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors p-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-900/50">
          <Store className="w-10 h-10 text-primary dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">Visión Global Activa</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
          Por seguridad, no es posible gestionar esta sección en el modo global. Selecciona una tienda específica.
        </p>
      </div>
    );
  }
  return <Outlet />;
};

const RoleProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Verificando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.rol)) return <Navigate to="/pos" replace />;
  return <Outlet />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SELLER']} />}>
          <Route element={<MainLayout />}>
            
            <Route path="/pos" element={<PosLayout />} />
            
            {/* INVENTARIO */}
            <Route element={<GlobalModeGuard />}>
              <Route path="/inventory" element={<ProductView />} />   
              <Route path="/inventory/labels" element={<LabelPrintingView />} />   
              <Route path="/inventory/transfers" element={<TransfersLayout />} />   
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/inventory/categories" element={<CategoryView />} />   
              <Route path="/inventory/kardex" element={<KardexView />} />   
            </Route>

            {/* CAJA Y FINANZAS */}
            <Route path="/finances" element={<CashRegisterView />} />
            <Route path="/finances/flow" element={<CashFlowView />} />
            <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/finances/history" element={<TurnHistoryView />} />
            </Route>

            {/* COMPRAS */}
            <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/compras" element={<SuppliersView />} />
              <Route path="/compras/history" element={<PurchaseHistoryView />} />
              <Route path="/compras/payables" element={<AccountsPayableView />} />
            </Route>

            {/* HISTORIAL */}
            <Route path="/history" element={<TransactionHistoryView forcedTab="VENTAS" />} />
            <Route path="/history/quotes" element={<TransactionHistoryView forcedTab="COTIZACIONES" />} />

            <Route path="/inventory/product/new" element={<ProductFormView />} />  
            <Route path="/inventory/product/edit/:id" element={<ProductFormView />} />
            <Route path="/inventory/product/:productId/variants" element={<VariantManagerView />} />     
            
            <Route path="/customers" element={<CustomersView />} /> 
            <Route path="/customers/profile/:id" element={<CustomerProfileView />} />        

            {/* ZONA VIP ADMINISTRACIÓN */}
            <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/" element={<DashboardView />} />
              <Route path="/audit" element={<AuditView />} />
              
              {/* 🚀 SUB-RUTAS DE REPORTES */}
              <Route path="/reports" element={<ReportsLayout />}>
                <Route index element={<Navigate to="sales" replace />} />
                <Route path="sales" element={<ReporteVentasView />} />
                <Route path="inventory" element={<ReporteInventarioView />} />
                <Route path="finances" element={<ReporteFinanzasView />} />
                <Route path="purchases" element={<ReporteComprasView />} />
              </Route>

              {/* 🚀 SUB-RUTAS DE CONFIGURACIÓN */}
              <Route path="/settings" element={<SettingsView forcedTab="formatos" />} />
              <Route path="/settings/stores" element={<SettingsView forcedTab="sucursales" />} />
              <Route path="/settings/users" element={<SettingsView forcedTab="usuarios" />} />
            </Route>

            <Route path="*" element={<div className="text-red-500 font-bold p-6">Error 404: Módulo no encontrado</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};