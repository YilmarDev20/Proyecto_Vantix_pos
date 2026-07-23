import { 
  LayoutDashboard, ShoppingCart, Package, Banknote,
  ShoppingBag, Users, ReceiptText, BarChart3, ShieldCheck, 
  Settings, Tag, Layers, ArrowLeftRight,
  Wallet, History, Landmark, Truck, CreditCard, Receipt, FileText,
  TrendingUp, Building2, Store, ShoppingBasket, Sliders, LineChart
} from 'lucide-react';

export interface NavSubItem {
  name: string;
  path: string;
  icon: any;
  exact?: boolean;
}

export interface NavAccordion {
  id: string;
  title: string;
  icon: any;
  basePath: string;
  items: NavSubItem[];
  adminOnly?: boolean;
}

export interface NavSingleLink {
  name: string;
  path: string;
  icon: any;
  adminOnly?: boolean;
}

export interface NavSection {
  sectionTitle?: string; // Título visible del grupo
  links?: NavSingleLink[];
  accordions?: NavAccordion[];
}

export const navigationSections: NavSection[] = [
  {
    sectionTitle: "GESTIÓN FÍSICA (POS)",
    links: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard, adminOnly: true },
      { name: "Punto de Venta", path: "/pos", icon: ShoppingCart },
    ],
    accordions: [
      {
        id: "inventory",
        title: "Inventario",
        icon: Package,
        basePath: "/inventory",
        items: [
          { name: "Catálogo Base", path: "/inventory", icon: Package, exact: true },
          { name: "Imprimir Etiquetas", path: "/inventory/labels", icon: Tag },
          { name: "Familias y Categorías", path: "/inventory/categories", icon: Layers },
          { name: "Kardex (Movimientos)", path: "/inventory/kardex", icon: ReceiptText },
          { name: "Traslados", path: "/inventory/transfers", icon: ArrowLeftRight },
        ]
      },
      {
        id: "finances",
        title: "Caja y Finanzas",
        icon: Banknote,
        basePath: "/finances",
        items: [
          { name: "Caja Operativa", path: "/finances", icon: Wallet, exact: true },
          { name: "Historial de Turnos", path: "/finances/history", icon: History },
          { name: "Efectivo / Movimientos", path: "/finances/flow", icon: Landmark },
        ]
      },
      {
        id: "purchases",
        title: "Compras",
        icon: ShoppingBag,
        basePath: "/compras",
        adminOnly: true,
        items: [
          { name: "Proveedores", path: "/compras", icon: Truck, exact: true },
          { name: "Registro de Compras", path: "/compras/history", icon: ShoppingCart },
          { name: "Cuentas por Pagar", path: "/compras/payables", icon: CreditCard },
        ]
      }
    ]
  },
  {
    // Grupo Clientes e Historial directo
    links: [
      { name: "Clientes", path: "/customers", icon: Users }
    ],
    accordions: [
      {
        id: "history",
        title: "Historial",
        icon: ReceiptText,
        basePath: "/history",
        items: [
          { name: "Ventas Reales", path: "/history", icon: Receipt, exact: true },
          { name: "Cotizaciones", path: "/history/quotes", icon: FileText },
        ]
      }
    ]
  },
  {
    sectionTitle: "CANAL DIGITAL (WEB)",
    accordions: [
      {
        id: "ecommerce",
        title: "Tienda Web",
        icon: ShoppingBasket,
        basePath: "/ecommerce",
        adminOnly: true,
        items: [
          { name: "Pedidos Entrantes", path: "/ecommerce/orders", icon: ShoppingBasket },
          { name: "Configuración Web", path: "/ecommerce/settings", icon: Sliders },
          { name: "Analítica Web", path: "/ecommerce/analytics", icon: LineChart },
        ]
      }
    ]
  },
  {
    sectionTitle: "SISTEMA & REPORTES",
    links: [
      { name: "Auditoría", path: "/audit", icon: ShieldCheck, adminOnly: true }
    ],
    accordions: [
      {
        id: "reports",
        title: "Reportes",
        icon: BarChart3,
        basePath: "/reports",
        adminOnly: true,
        items: [
          { name: "Ventas y Rentabilidad", path: "/reports/sales", icon: TrendingUp },
          { name: "Inventario Predictivo", path: "/reports/inventory", icon: Package },
          { name: "Finanzas y Caja", path: "/reports/finances", icon: Banknote },
          { name: "Compras y Deudas", path: "/reports/purchases", icon: ShoppingBag },
        ]
      },
      {
        id: "settings",
        title: "Configuración",
        icon: Settings,
        basePath: "/settings",
        adminOnly: true,
        items: [
          { name: "Formatos y Empresa", path: "/settings", icon: Building2, exact: true },
          { name: "Sucursales (Tiendas)", path: "/settings/stores", icon: Store },
          { name: "Usuarios y Roles", path: "/settings/users", icon: Users },
        ]
      }
    ]
  }
];