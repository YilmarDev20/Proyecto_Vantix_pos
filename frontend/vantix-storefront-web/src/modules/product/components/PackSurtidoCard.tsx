"use client";

import { useState } from "react";
import { Gift, Plus, Minus, ShoppingBag } from "lucide-react";
import { PackSurtidoWebDTO, VarianteWebDTO, ProductoPadreWebDTO } from "../../catalog/types/catalog.types";
import { useCartStore } from "../../cart/store/useCartStore";

interface PackSurtidoCardProps {
  product: ProductoPadreWebDTO;
  variantes: VarianteWebDTO[];
  packs: PackSurtidoWebDTO[];
}

export const PackSurtidoCard = ({ product, variantes, packs }: PackSurtidoCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [packActivo, setPackActivo] = useState<PackSurtidoWebDTO | null>(null);
  const [distribucion, setDistribucion] = useState<Record<number, number>>({});

  if (!packs || packs.length === 0 || !variantes || variantes.length === 0) return null;

  const seleccionarPack = (pack: PackSurtidoWebDTO) => {
    setPackActivo(pack);
    const inicial: Record<number, number> = {};
    variantes.forEach((v, index) => {
      inicial[v.id] = index === 0 ? pack.cantidadRequerida : 0;
    });
    setDistribucion(inicial);
  };

  const totalSeleccionado = Object.values(distribucion).reduce((sum, q) => sum + q, 0);
  const cantidadRequerida = packActivo?.cantidadRequerida || 0;
  const esCantidadCorrecta = totalSeleccionado === cantidadRequerida;

  const modificarCantidad = (varianteId: number, delta: number) => {
    if (!packActivo) return;

    setDistribucion((prev) => {
      const actual = prev[varianteId] || 0;
      const nuevoValor = Math.max(0, actual + delta);
      const totalSinActual = totalSeleccionado - actual;

      if (totalSinActual + nuevoValor > cantidadRequerida) return prev;

      return { ...prev, [varianteId]: nuevoValor };
    });
  };

  const agregarPackAlCarrito = () => {
    if (!packActivo || !esCantidadCorrecta) return;

    const resumenVariantes = variantes
      .filter((v) => (distribucion[v.id] || 0) > 0)
      .map((v) => `${distribucion[v.id]}x ${v.nombreVariante || v.sku}`)
      .join(", ");

    const itemPack: any = {
      id: `pack-${packActivo.id}-${Date.now()}`,
      productoId: product.id,
      productoNombre: `${product.nombre} - ${packActivo.nombre} (${resumenVariantes})`,
      marcaNombre: product.marca,
      categoriaId: product.categoriaId,
      precioVenta: packActivo.precioPack,
      precioOferta: null,
      stockActual: 999,
      imagenUrl: product.imagenUrl,
    };

    addItem(itemPack);
    setPackActivo(null);
  };

  return (
    <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center space-x-2 text-fuchsia-800 font-extrabold text-xs sm:text-sm">
        <Gift className="w-4 h-4 text-fuchsia-600 shrink-0" />
        <span>Packs Promocionales Surtidos:</span>
      </div>

      <div className="space-y-2">
        {packs.map((pack) => {
          const isSelected = packActivo?.id === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => seleccionarPack(pack)}
              className={`w-full text-left text-xs p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                isSelected
                  ? "bg-white border-fuchsia-600 ring-2 ring-fuchsia-400/20 shadow-sm"
                  : "bg-white/80 border-fuchsia-100 hover:border-fuchsia-300"
              }`}
            >
              <div>
                <span className="font-bold text-slate-800 block">{pack.nombre}</span>
                <span className="text-[11px] text-slate-500">Llévalo por {pack.cantidadRequerida} unidades surtidas</span>
              </div>
              <span className="font-black text-fuchsia-600 text-sm">S/ {pack.precioPack.toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {packActivo && (
        <div className="bg-white rounded-xl p-3.5 border border-fuchsia-200 space-y-3 pt-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700">
              Personaliza tu {packActivo.nombre}:
            </span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              esCantidadCorrecta ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {totalSeleccionado} / {cantidadRequerida} uds
            </span>
          </div>

          <div className="space-y-2">
            {variantes.map((v) => {
              const cant = distribucion[v.id] || 0;
              return (
                <div key={v.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                  {/* Class max-w-45 actualizada */}
                  <span className="font-semibold text-slate-700 truncate max-w-45">
                    {v.nombreVariante || v.sku}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => modificarCantidad(v.id, -1)}
                      className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-slate-800 w-4 text-center">{cant}</span>
                    <button
                      type="button"
                      onClick={() => modificarCantidad(v.id, 1)}
                      className="p-1 bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!esCantidadCorrecta}
            onClick={agregarPackAlCarrito}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm ${
              esCantidadCorrecta
                ? "bg-fuchsia-600 hover:bg-fuchsia-700 text-white cursor-pointer active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {esCantidadCorrecta
                ? `Agregar ${packActivo.nombre} por S/ ${packActivo.precioPack.toFixed(2)}`
                : `Completa las ${cantidadRequerida} unidades para continuar`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};