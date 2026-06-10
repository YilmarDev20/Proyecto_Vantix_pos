import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Tag, Sparkles } from 'lucide-react'; // Importamos iconos para el Placeholder
import { useAuth } from '@/core/auth/context/AuthContext'; 

import { MainLayout } from '@/layouts/MainLayout';
import { LoginView } from '@/features/auth/views/LoginView'; 

import { CustomersView } from '@/features/customers/views/CustomersView';
import { CustomerProfileView } from '@/features/customers/views/CustomerProfileView';
import { SettingsView } from '@/features/settings/views/SettingsView';
import { InventoryLayout } from '@/features/inventory/views/InventoryLayout';
import { ProductFormView } from '@/features/inventory/product/views/ProductFormView';
import { VariantManagerView } from '@/features/inventory/variant/views/VariantManagerView';
import { FinancesLayout } from '@/features/finances/views/FinancesLayout';
import { PurchasesLayout } from '@/features/purchases/views/PurchasesLayout';
import { TransactionHistoryView } from '@/features/history/views/TransactionHistoryView';
import { PosLayout } from '@/features/pos/views/PosLayout';
import { AuditView } from '@/features/audit/views/AuditView';
import { ReporteInventarioView } from '@/features/reports/views/ReporteInventarioView';
import { ReporteFinanzasView } from '@/features/reports/views/ReporteFinanzasView';
import { ReporteVentasView } from '@/features/reports/views/ReporteVentasView';
import { ReporteComprasView } from '@/features/reports/views/ReporteComprasView';
import { DashboardView } from '@/features/dashboard/views/DashboardView'; 
import { ReportsLayout } from '@/features/reports/views/ReportsLayout';

// ==========================================
// PLACEHOLDER: PROMOCIONES (MUY PRONTO)
// ==========================================
const PromotionsPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in-95 duration-500">
    <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center max-w-lg relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-10"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-purple-100">
          <Tag className="w-12 h-12 text-purple-500" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-3 flex items-center justify-center">
          Módulo de Promociones <Sparkles className="w-6 h-6 ml-2 text-amber-400" />
        </h2>
        
        <p className="text-slate-500 mb-8 text-lg">
          Estamos preparando un potente motor de descuentos, 2x1 y cupones especiales para impulsar tus ventas.
        </p>
        
        <div className="inline-flex items-center px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-full text-sm uppercase tracking-widest border border-slate-200">
          ¡Disponible Muy Pronto!
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// EL NUEVO GUARDIÁN DE RUTAS POR ROLES
// ==========================================
const RoleProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está logueado pero su rol NO está en la lista de permitidos
  if (user && !allowedRoles.includes(user.rol)) {
    // Lo pateamos a una ruta segura (Punto de Venta)
    return <Navigate to="/pos" replace />;
  }

  return <Outlet />;
};

// ==========================================
// ENRUTADOR PRINCIPAL
// ==========================================
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/login" element={<LoginView />} />

        {/* LAYOUT PRINCIPAL (Requiere estar logueado, sin importar el rol) */}
        <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SELLER']} />}>
          <Route element={<MainLayout />}>
            
            {/* ----------------------------------------------------
                ZONA COMPARTIDA (Admin y Cajero pueden entrar)
                ---------------------------------------------------- */}
            <Route path="/pos" element={<PosLayout />} />
            <Route path="/inventory" element={<InventoryLayout />} />   
            <Route path="/inventory/product/new" element={<ProductFormView />} />  
            <Route path="/inventory/product/edit/:id" element={<ProductFormView />} />
            <Route path="/inventory/product/:productId/variants" element={<VariantManagerView />} />     
            <Route path="/promotions" element={<PromotionsPlaceholder />} />
            <Route path="/finances" element={<FinancesLayout />} />
            <Route path="/customers" element={<CustomersView />} /> 
            <Route path="/customers/profile/:id" element={<CustomerProfileView />} />        
            <Route path="/history" element={<TransactionHistoryView />} />

            {/* ----------------------------------------------------
                ZONA VIP (SOLO PARA ADMINISTRADORES)
                ---------------------------------------------------- */}
            <Route element={<RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/" element={<DashboardView />} />
              <Route path="/compras" element={<PurchasesLayout />} /> {/* El cajero no compra mercadería */}
              <Route path="/audit" element={<AuditView />} />
              <Route path="/settings" element={<SettingsView />} />
              
              <Route path="/reports" element={<ReportsLayout />}>
                <Route index element={<Navigate to="sales" replace />} />
                <Route path="sales" element={<ReporteVentasView />} />
                <Route path="inventory" element={<ReporteInventarioView />} />
                <Route path="finances" element={<ReporteFinanzasView />} />
                <Route path="purchases" element={<ReporteComprasView />} />
              </Route>
            </Route>

            {/* RUTA DE ESCAPE (404) */}
            <Route path="*" element={<div className="text-red-500 font-bold p-6">Error 404: Módulo no encontrado</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};