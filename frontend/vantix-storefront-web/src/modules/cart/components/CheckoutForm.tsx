"use client";

import { User, Phone, CreditCard, Upload, Image as ImageIcon, X, Store, Lock, Loader2, AlertTriangle, QrCode } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { useWebSettings } from "@/hooks/useWebSettings";

export interface SedeTienda {
  id: number;
  nombre: String;
  direccion?: string;
}

export interface CheckoutData {
  nombre: string;
  telefono: string;
  tipoEntrega: "recojo" | "envio";
  direccion: string;
  metodoPago: "YAPE" | "PLIN";
  comprobanteFile: File | null;
  sedeId: number;
  nombreSedeSeleccionada: string;
}

interface CheckoutFormProps {
  data: CheckoutData;
  onChange: (newData: Partial<CheckoutData>) => void;
}

export const CheckoutForm = ({ data, onChange }: CheckoutFormProps) => {
  const [sedes, setSedes] = useState<SedeTienda[]>([]);
  const [loadingSedes, setLoadingSedes] = useState<boolean>(true);
  const { items } = useCartStore();
  const { config } = useWebSettings();

  const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const apiBase = envApi.replace("/api/v1", "");

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        setLoadingSedes(true);
        const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const apiBaseUrl = envApi.endsWith("/api/v1") ? envApi : `${envApi.replace(/\/$/, "")}/api/v1`;

        const res = await fetch(`${apiBaseUrl}/public/tiendas`);
        if (res.ok) {
          const dataTiendas: SedeTienda[] = await res.json();
          if (dataTiendas && dataTiendas.length > 0) {
            setSedes(dataTiendas);
            if (!data.sedeId) {
              onChange({
                sedeId: dataTiendas[0].id,
                nombreSedeSeleccionada: String(dataTiendas[0].nombre),
              });
            }
            return;
          }
        }
        throw new Error("Respuesta de tiendas no válida");
      } catch (error) {
        console.warn("Usando sedes de respaldo:", error);
        const sedesFallback: SedeTienda[] = [
          { id: 2, nombre: "Dos Palmas", direccion: "Avenida San Martin F lote 15" },
          { id: 1, nombre: "Independencias", direccion: "Federico Uranga" },
        ];
        setSedes(sedesFallback);
        if (!data.sedeId) {
          onChange({
            sedeId: sedesFallback[0].id,
            nombreSedeSeleccionada: String(sedesFallback[0].nombre),
          });
        }
      } finally {
        setLoadingSedes(false);
      }
    };

    fetchSedes();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange({ comprobanteFile: e.target.files[0] });
    }
  };

  const removeFile = () => {
    onChange({ comprobanteFile: null });
  };

  const esSedeSinStockDirecto = items.some((item) => {
    return data.sedeId === 1 && (item.product.stockActual === 0 || data.nombreSedeSeleccionada.toLowerCase().includes("independencia"));
  });

  const fullQrUrl = config?.yapeQrUrl
    ? config.yapeQrUrl.startsWith("http")
      ? config.yapeQrUrl
      : `${apiBase}${config.yapeQrUrl}`
    : null;

  return (
    <div className="space-y-4">
      {/* NOMBRE COMPLETO */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={data.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none"
          />
          <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* TELÉFONO / WHATSAPP */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *</label>
        <div className="relative">
          <input
            type="tel"
            placeholder="Ej. 987654321"
            value={data.telefono}
            onChange={(e) => onChange({ telefono: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-fuchsia-500 outline-none"
          />
          <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* OPCIONES DE ENTREGA */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Opciones de Entrega</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ tipoEntrega: "recojo" })}
            className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              data.tipoEntrega === "recojo"
                ? "border-fuchsia-600 bg-fuchsia-50 text-fuchsia-700 shadow-xs"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Store className="w-4 h-4 text-fuchsia-600" />
            <span>Recojo en Tienda</span>
          </button>

          <div
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold flex flex-col items-center justify-center relative cursor-not-allowed opacity-75"
            title="Próximamente disponible"
          >
            <div className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Envío a Domicilio</span>
            </div>
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 mt-0.5">
              Próximamente
            </span>
          </div>
        </div>
      </div>

      {/* SELECTOR DE SEDE */}
      {data.tipoEntrega === "recojo" && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            ¿En qué sede vas a recoger tu pedido? *
          </label>

          {loadingSedes ? (
            <div className="flex items-center justify-center py-4 text-slate-400 space-x-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-fuchsia-600" />
              <span>Cargando tiendas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sedes.map((s) => {
                const isSelected = data.sedeId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onChange({ sedeId: s.id, nombreSedeSeleccionada: String(s.nombre) })}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-fuchsia-600 bg-white text-fuchsia-700 ring-2 ring-fuchsia-400/20 font-black shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-semibold"
                    }`}
                  >
                    <div className="text-xs">{s.nombre}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {s.direccion || "Sucursal Principal"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {esSedeSinStockDirecto && (
            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2 text-[11px] text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Solicitud de Traslado Requerida</span>
                Este producto se encuentra en <strong>Dos Palmas</strong>. Al confirmar, solicitaremos un traslado interno hacia <strong>{data.nombreSedeSeleccionada}</strong> (Disponible para recojo en 24h).
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEDIO DE PAGO Y CAJA DE QR DINÁMICO */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">Medio de Pago Aceptado</label>
        <div className="relative">
          <select
            value={data.metodoPago}
            onChange={(e) => onChange({ metodoPago: e.target.value as "YAPE" | "PLIN" })}
            className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
          >
            <option value="YAPE" className="bg-white text-slate-900">💜 Yape / Plin (Pago Inmediato)</option>
          </select>
          <CreditCard className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* TARJETA CON INFORMACIÓN DE PAGO DINÁMICA DEL BACKEND */}
      <div className="p-3 bg-fuchsia-50/80 rounded-xl border border-fuchsia-200 text-center space-y-2">
        <div className="text-xs font-bold text-fuchsia-900 flex items-center justify-center space-x-1">
          <QrCode className="w-4 h-4 text-fuchsia-600" />
          <span>Realiza tu Yape/Plin al siguiente número:</span>
        </div>

        <div className="text-lg font-black text-fuchsia-700">
          {config?.yapeTelefono || "927780621"}
        </div>
        <div className="text-[11px] text-slate-600 font-bold">
          Titular: <span className="text-slate-800">{config?.yapeTitular || "Zarely Moda & Accesorios"}</span>
        </div>

        {fullQrUrl && (
          <div className="flex justify-center pt-1">
            <img
              src={fullQrUrl}
              alt="QR Yape"
              className="max-h-36 object-contain rounded-xl border border-fuchsia-200 shadow-xs"
            />
          </div>
        )}
      </div>

      {/* COMPROBANTE YAPE/PLIN */}
      <div className="bg-fuchsia-50/50 p-3 rounded-xl border border-fuchsia-200 space-y-2">
        <label className="text-xs font-bold text-slate-800 block">
          Captura o Voucher del Yape / Plin *
        </label>
        <p className="text-[11px] text-slate-500">
          Adjunta la foto de tu pago para verificar tu pedido en caja central.
        </p>

        {!data.comprobanteFile ? (
          <label className="flex items-center justify-center space-x-2 border-2 border-dashed border-fuchsia-300 hover:border-fuchsia-500 bg-white p-3 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-fuchsia-600" />
            <span className="text-xs font-bold text-fuchsia-700">Adjuntar Foto Voucher</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-2 bg-white border border-fuchsia-200 rounded-lg">
            <div className="flex items-center space-x-2 truncate">
              <ImageIcon className="w-4 h-4 text-fuchsia-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 truncate">
                {data.comprobanteFile.name}
              </span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};