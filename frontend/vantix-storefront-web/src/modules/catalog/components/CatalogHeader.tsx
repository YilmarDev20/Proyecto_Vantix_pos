"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Sparkles, Store } from "lucide-react";
import { useCartStore } from "../../cart/store/useCartStore";

export const CatalogHeader = () => {
  const pathname = usePathname();
  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* BRANDING LOGO */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-wider text-fuchsia-600 leading-none">
            ZARELY
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:inline-block">
            Tienda Web
          </span>
        </Link>

        {/* 🚀 PESTAÑAS NAVEGACIÓN PRINCIPAL */}
        <nav className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <Link
            href="/"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              pathname === "/"
                ? "bg-white text-fuchsia-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>

          <Link
            href="/catalogo"
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              pathname === "/catalogo"
                ? "bg-white text-fuchsia-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Catálogo</span>
          </Link>
        </nav>

        {/* ACCIONES Y CARRITO */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleCart}
            className="relative p-2.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 rounded-xl transition-colors cursor-pointer"
            title="Ver Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};