"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ProductoPadreWebDTO, VarianteWebDTO, PresentacionWebDTO } from "../../catalog/types/catalog.types";
import { useCartStore } from "../../cart/store/useCartStore";
import { VariantSelector } from "../../product/components/VariantSelector";
import { PackagingSelector } from "./PackagingSelector";
import { PackSurtidoCard } from "./PackSurtidoCard";
import { StoreAvailabilityCard } from "../../product/components/StoreAvailabilityCard";

interface ProductDetailViewProps {
  product: ProductoPadreWebDTO;
  nombreSede?: string;
}

export const ProductDetailView = ({ product }: ProductDetailViewProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const [varianteSeleccionada, setVarianteSeleccionada] = useState<VarianteWebDTO | null>(
    product.variantes?.[0] || null
  );

  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState<PresentacionWebDTO | null>(
    product.variantes?.[0]?.presentaciones?.[0] || null
  );

  const [cantidad, setCantidad] = useState(1);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const rawImg = varianteSeleccionada?.imagenUrl || product.imagenUrl;
  const urlImagen = rawImg
    ? rawImg.startsWith("http") ? rawImg : `${apiBase}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
    : null;

  // 🚀 EXTRAER Y EVALUAR STOCK DE SEDES
  const sedesDisponibles = varianteSeleccionada?.disponibilidadesSedes || product.disponibilidadesSedes || [];
  // 🧪 LINEA DE DIAGNÓSTICO (Temporal para ver la estructura exacta del backend)
  console.log("🔍 ESTRUCTURA REAL DE SEDES DESDE LA API:", sedesDisponibles);
  console.log("🔍 VARIANTE SELECCIONADA:", varianteSeleccionada);

  const stockCalculado = sedesDisponibles.reduce((acc: number, s: any) => {
    const val = typeof s.stock === "number" 
      ? s.stock 
      : (typeof s.stockActual === "number" ? s.stockActual : 0);
    return acc + val;
  }, 0);

  const stockDirecto = varianteSeleccionada?.stockActual ?? product.stockTotalTienda ?? 0;

  const hayStockDisponibilidad = sedesDisponibles.some(
    (s: any) =>
      s.estadoStock === "DISPONIBLE" ||
      s.estadoStock === "ULTIMAS_UNIDADES" ||
      s.disponible === true ||
      s.hayStock === true
  );

  // 🛡️ Límite máximo: Si el backend envía el número real lo usa, de lo contrario habilita límite de compra
  const maxStockDisponible = stockCalculado > 0 
    ? stockCalculado 
    : (stockDirecto > 0 ? stockDirecto : (hayStockDisponibilidad ? 15 : 0));

  const hayStock = maxStockDisponible > 0;

  const precioRegular = presentacionSeleccionada
    ? presentacionSeleccionada.precioVenta
    : varianteSeleccionada?.precioVenta ?? product.precioDesde;

  const tieneOferta = !presentacionSeleccionada && varianteSeleccionada?.precioOferta != null && varianteSeleccionada.precioOferta > 0;
  const precioEfectivo = tieneOferta ? varianteSeleccionada!.precioOferta! : precioRegular;

  // 🚀 CONTROL DEL BOTÓN (+) CON ALERTA SONNER
  const handleIncrementar = () => {
    if (cantidad < maxStockDisponible) {
      setCantidad((prev) => prev + 1);
    } else {
      toast.warning("Límite de compra alcanzado", {
        description: "Has seleccionado la cantidad máxima disponible por pedido para este producto.",
        duration: 3500,
      });
    }
  };

  const handleDecrementar = () => {
    setCantidad((prev) => Math.max(1, prev - 1));
  };

  const handleAgregarAlCarrito = () => {
    if (!varianteSeleccionada) return;

    if (cantidad > maxStockDisponible) {
      toast.error("Stock insuficiente", {
        description: `No puedes agregar ${cantidad} unidades. El stock disponible es de ${maxStockDisponible} unids.`,
      });
      return;
    }

    let nombreFinal = product.nombre;
    if (varianteSeleccionada.nombreVariante && varianteSeleccionada.nombreVariante !== "Estándar") {
      nombreFinal += ` (${varianteSeleccionada.nombreVariante})`;
    }
    if (presentacionSeleccionada) {
      nombreFinal += ` - Empaque: ${presentacionSeleccionada.nombre}`;
    }

    const itemCarrito: any = {
      id: varianteSeleccionada.id,
      productoId: product.id,
      productoNombre: nombreFinal,
      marcaNombre: product.marca,
      categoriaId: product.categoriaId,
      sku: varianteSeleccionada.sku,
      codigoBarras: presentacionSeleccionada?.codigoBarras || varianteSeleccionada.codigoBarras,
      precioVenta: precioEfectivo,
      precioOferta: tieneOferta ? varianteSeleccionada.precioOferta : null,
      stockActual: maxStockDisponible,
      imagenUrl: rawImg,
    };

    for (let i = 0; i < cantidad; i++) {
      addItem(itemCarrito);
    }

    toast.success("Producto agregado al carrito", {
      description: `Se agregaron ${cantidad} unid. de "${nombreFinal}" a tu lista.`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <Link href="/" className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-fuchsia-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* IMAGEN DEL PRODUCTO */}
          <div className="bg-slate-100 rounded-xl aspect-square relative flex items-center justify-center overflow-hidden border border-slate-200">
            {urlImagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urlImagen} alt={product.nombre} className="object-cover w-full h-full" />
            ) : (
              <span className="text-6xl">📎</span>
            )}
            {tieneOferta && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                ¡Oferta!
              </span>
            )}
          </div>

          {/* INFORMACIÓN Y ACCIONES */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                {product.marca && (
                  <span className="text-xs font-extrabold uppercase tracking-wider text-fuchsia-600 block mb-1">
                    {product.marca}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {product.nombre}
                </h1>
                {product.descripcion && (
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{product.descripcion}</p>
                )}
              </div>

              <StoreAvailabilityCard sedes={sedesDisponibles} />

              <div className="py-3 border-y border-slate-100 space-y-1">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    S/ {precioEfectivo.toFixed(2)}
                  </span>
                  {tieneOferta && (
                    <span className="text-base sm:text-lg text-slate-400 line-through font-bold">
                      S/ {varianteSeleccionada?.precioVenta.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <VariantSelector
                variantes={product.variantes}
                seleccionada={varianteSeleccionada}
                onSelect={(v) => {
                  setVarianteSeleccionada(v);
                  setPresentacionSeleccionada(v.presentaciones?.[0] || null);
                  setCantidad(1);
                }}
              />

              <PackagingSelector
                presentaciones={varianteSeleccionada?.presentaciones || []}
                seleccionada={presentacionSeleccionada}
                onSelect={setPresentacionSeleccionada}
              />

              <PackSurtidoCard
                product={product}
                variantes={product.variantes}
                packs={product.packsSurtidos}
              />

              <div className="space-y-2 text-xs text-slate-500 pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Stock verificado en tiendas Zarely.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-fuchsia-500 shrink-0" />
                  <span>Atención rápida y pedidos directos vía WhatsApp.</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE CANTIDAD Y BOTÓN DE CARRITO */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-slate-700">Cantidad:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    type="button"
                    disabled={cantidad <= 1}
                    onClick={handleDecrementar}
                    className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-xl transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-black text-slate-800">{cantidad}</span>
                  <button
                    type="button"
                    onClick={handleIncrementar}
                    className="px-3 py-1.5 text-slate-600 font-bold hover:bg-slate-200 rounded-r-xl transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!hayStock}
                onClick={handleAgregarAlCarrito}
                className={`w-full font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 ${
                  hayStock
                    ? "bg-slate-900 hover:bg-fuchsia-600 text-white cursor-pointer active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {hayStock
                    ? `Agregar ${cantidad} al Carrito (S/ ${(precioEfectivo * cantidad).toFixed(2)})`
                    : "Agotado en Tiendas"}
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};