import { useState } from "react";
import Link from "next/link";
import { Eye, Sparkles } from "lucide-react";
import { ProductoPadreWebDTO } from "../types/catalog.types";

interface ProductCardProps {
  item: ProductoPadreWebDTO;
}

export const ProductCard = ({ item }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  const obtenerUrlImagen = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const urlImagen = obtenerUrlImagen(item.imagenUrl);

  // 🚀 EVALUACIÓN OMNICANAL DE STOCK CORRECTA:
  const hayStockEnSedes = item.disponibilidadesSedes?.some(
    (s) => s.estadoStock === "DISPONIBLE" || s.estadoStock === "ULTIMAS_UNIDADES"
  );
  const hayStock = (item.stockTotalTienda && item.stockTotalTienda > 0) || hayStockEnSedes;

  const esRango = item.precioDesde !== item.precioHasta;
  const numVariantes = item.variantes?.length || 0;
  const tienePacks = item.packsSurtidos && item.packsSurtidos.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-fuchsia-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group h-full">
      
      {/* LINK DE IMAGEN HACIA EL DETALLE */}
      <Link 
        href={`/producto/${item.id}`} 
        className="bg-slate-50 aspect-square w-full relative flex items-center justify-center text-slate-300 overflow-hidden cursor-pointer"
      >
        {urlImagen && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlImagen}
            alt={item.nombre}
            onError={() => setImageError(true)}
            className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4">
            <span className="text-3xl font-black text-slate-300">ZARELY</span>
            <span className="text-[10px] font-bold mt-1 uppercase text-slate-400 tracking-wider">Sin Imagen</span>
          </div>
        )}

        {/* Badge de Mix & Match / Packs Surtidos sin Emoji */}
        {tienePacks && (
          <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Mix & Match</span>
          </span>
        )}

        {/* Badge de Disponibilidad estilo Pill */}
        <span
          className={`absolute top-2.5 right-2.5 text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1.5 ${
            hayStock
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
              : "bg-slate-200/90 text-slate-600 border border-slate-300"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${hayStock ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {hayStock ? "Disponible" : "Agotado"}
        </span>
      </Link>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {item.marca && (
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-fuchsia-600 block">
              {item.marca}
            </span>
          )}
          <Link href={`/producto/${item.id}`}>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 line-clamp-2 leading-tight group-hover:text-fuchsia-600 transition-colors cursor-pointer">
              {item.nombre}
            </h2>
          </Link>
        </div>

        {/* PRECIOS Y CATEGORÍAS */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-baseline space-x-1.5">
            {esRango && <span className="text-xs font-bold text-slate-400">Desde</span>}
            <span className="text-lg sm:text-2xl font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">
              S/ {item.precioDesde?.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {numVariantes > 1 && (
              <span className="inline-block bg-fuchsia-50 text-fuchsia-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-fuchsia-200/60">
                {numVariantes} opciones
              </span>
            )}
            {item.categoriaNombre && (
              <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200/60">
                {item.categoriaNombre}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTÓN CON ICONO VECTORIAL LINT/LUCIDE */}
      <div className="p-3.5 pt-0">
        <Link 
          href={`/producto/${item.id}`}
          className={`w-full font-black py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-xs ${
            hayStock
              ? "bg-slate-900 text-white hover:bg-fuchsia-600 hover:shadow-fuchsia-500/25 hover:shadow-lg cursor-pointer active:scale-95"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <span>{hayStock ? "Ver Opciones" : "Sin Stock"}</span>
          <Eye className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
        </Link>
      </div>

    </div>
  );
};