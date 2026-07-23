"use client";

import { useEffect, useState } from "react";
import { X, ShoppingBag, MessageCircle, Loader2, CheckCircle2, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { CartItemList } from "./CartItemList";
import { CheckoutForm, CheckoutData } from "./CheckoutForm";

interface CartDrawerProps {
  nombreSede: string;
  tiendaId?: number;
}

export const CartDrawer = ({ nombreSede, tiendaId = 2 }: CartDrawerProps) => {
  const [mounted, setMounted] = useState(false);
  const [paso, setPaso] = useState<"carrito" | "checkout" | "exito">("carrito");
  const [loading, setLoading] = useState(false);
  const [codigoExito, setCodigoExito] = useState<string>("");

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    nombre: "",
    telefono: "",
    tipoEntrega: "recojo",
    direccion: "",
    metodoPago: "YAPE",
    comprobanteFile: null,
    sedeId: tiendaId,
    nombreSedeSeleccionada: nombreSede || "Dos Palmas",
  });

  const { items, isOpen, closeCart, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const total = getTotalPrice();

  const handleDataChange = (newData: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...newData }));
  };

  // Evalúa si la sede seleccionada es la de traslado (Independencias)
  const requiereTrasladoSede = checkoutData.nombreSedeSeleccionada.toLowerCase().includes("independencia");

  const resetearYBuscarMas = () => {
    setCheckoutData({
      nombre: "",
      telefono: "",
      tipoEntrega: "recojo",
      direccion: "",
      metodoPago: "YAPE",
      comprobanteFile: null,
      sedeId: tiendaId,
      nombreSedeSeleccionada: nombreSede || "Dos Palmas",
    });
    setPaso("carrito");
    setCodigoExito("");
    closeCart();
  };

  const procesarYEnviarPedido = async () => {
    if (!checkoutData.nombre.trim() || !checkoutData.telefono.trim()) {
      alert("Por favor ingresa tu nombre y teléfono.");
      return;
    }
    if (checkoutData.tipoEntrega === "envio" && !checkoutData.direccion.trim()) {
      alert("Por favor ingresa la dirección para el envío.");
      return;
    }
    if (!checkoutData.comprobanteFile) {
      alert("Por favor sube la foto del comprobante del Yape / Plin.");
      return;
    }

    try {
      setLoading(true);

      const itemsMapped = items.map((i) => {
        const idNumerico = typeof i.product.id === "number" 
          ? i.product.id 
          : Number(i.product.productoId) || 1;

        const precioUnit = i.product.precioOferta ?? i.product.precioVenta;

        return {
          varianteId: idNumerico,
          productoNombre: i.product.productoNombre,
          cantidad: i.quantity,
          precioUnitario: precioUnit,
          subtotal: precioUnit * i.quantity,
        };
      });

      const datosPedido = {
        clienteNombre: checkoutData.nombre,
        clienteTelefono: checkoutData.telefono,
        tiendaId: checkoutData.sedeId,
        metodoPago: checkoutData.metodoPago,
        montoTotal: total,
        items: itemsMapped,
      };

      const formData = new FormData();
      const jsonBlob = new Blob([JSON.stringify(datosPedido)], {
        type: "application/json",
      });
      formData.append("datos", jsonBlob, "datos.json");

      if (checkoutData.comprobanteFile) {
        formData.append("comprobante", checkoutData.comprobanteFile);
      }

      const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const apiBase = envApi.endsWith("/api/v1") 
        ? envApi 
        : `${envApi.replace(/\/$/, "")}/api/v1`;

      const res = await fetch(`${apiBase}/public/pedidos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Respuesta fallida del servidor:", errorText);
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const pedidoGuardado = await res.json();
      const codigoGenerado = pedidoGuardado.codigoPedido || "ZAR-WEB";

      setCodigoExito(codigoGenerado);
      clearCart();
      setPaso("exito");

    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un problema al procesar tu pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={paso === "exito" ? resetearYBuscarMas : closeCart} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col relative">
          
          {/* HEADER */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-lg font-bold">
                {paso === "carrito" && "Mi Carrito"}
                {paso === "checkout" && "Datos de Entrega"}
                {paso === "exito" && "¡Pedido Registrado!"}
              </h2>
            </div>
            <button 
              type="button" 
              onClick={paso === "exito" ? resetearYBuscarMas : closeCart} 
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENIDO */}
          <div className="flex-1 overflow-y-auto p-4">
            {paso === "carrito" && <CartItemList />}

            {paso === "checkout" && (
              <CheckoutForm data={checkoutData} onChange={handleDataChange} />
            )}

            {/* 🚀 PANTALLA DE ÉXITO PROFESIONAL */}
            {paso === "exito" && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 my-auto">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full border border-fuchsia-200">
                    N° {codigoExito}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-2">
                    ¡Gracias por tu compra!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Tu comprobante ha sido recibido correctamente y la orden fue enviada a la caja central del POS.
                  </p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cliente:</span>
                    <span className="font-bold text-slate-800">{checkoutData.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Método de Pago:</span>
                    <span className="font-bold text-slate-800">{checkoutData.metodoPago}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sede Elegida:</span>
                    <span className="font-bold text-slate-800">{checkoutData.nombreSedeSeleccionada}</span>
                  </div>

                  {/* 📦 NOTA DE TRASLADO EN LA PANTALLA DE ÉXITO */}
                  {requiereTrasladoSede && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-[11px] text-amber-900 font-semibold">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Traslado solicitado: Disponible para recojo en <strong>24 horas</strong>.</span>
                    </div>
                  )}
                </div>

                {/* BOTONES POST-VENTA */}
                <div className="pt-2 w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const numeroWhatsApp = "51900000000"; // ⚠️ Tu número real
                      const mensaje = `Hola, acabo de realizar el pedido *${codigoExito}* en la web para la sede *${checkoutData.nombreSedeSeleccionada}* ${
                        requiereTrasladoSede ? "(Con traslado a 24h)" : ""
                      }. ¡Quedo atento a la confirmación!`;
                      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Abrir WhatsApp para Consultas</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetearYBuscarMas}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Seguir Comprando</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PIE SOLO PARA PASOS 1 Y 2 */}
          {paso !== "exito" && items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Sede de Recojo:</span>
                <span className="font-bold text-slate-800">{checkoutData.nombreSedeSeleccionada}</span>
              </div>
              <div className="flex justify-between text-base font-black">
                <span className="text-slate-800">Total:</span>
                <span className="text-fuchsia-600">S/ {total.toFixed(2)}</span>
              </div>

              {paso === "carrito" ? (
                <button
                  type="button"
                  onClick={() => setPaso("checkout")}
                  className="w-full bg-slate-900 hover:bg-fuchsia-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Continuar con mis datos
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={procesarYEnviarPedido}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Registrando Pedido...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>Confirmar Pedido</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setPaso("carrito")}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                  >
                    ← Volver a productos
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};