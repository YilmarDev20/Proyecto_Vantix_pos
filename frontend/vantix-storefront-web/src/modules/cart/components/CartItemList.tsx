"use client";

import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export const CartItemList = () => {
  const { items, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-700">Tu carrito está vacío</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const precio = item.product.precioOferta ?? item.product.precioVenta;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const imgUrl = item.product.imagenUrl
          ? item.product.imagenUrl.startsWith("http")
            ? item.product.imagenUrl
            : `${apiBase}${item.product.imagenUrl.startsWith("/") ? "" : "/"}${item.product.imagenUrl}`
          : null;

        return (
          <div
            key={item.product.id}
            className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
          >
            <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgUrl} alt={item.product.productoNombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">📎</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {item.product.productoNombre}
              </h4>
              <p className="text-xs font-black text-slate-900 mt-0.5">S/ {precio.toFixed(2)}</p>

              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};