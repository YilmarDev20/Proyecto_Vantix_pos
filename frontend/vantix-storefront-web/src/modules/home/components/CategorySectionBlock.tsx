"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { ProductoPadreWebDTO } from "@/modules/catalog/types/catalog.types";
import { ProductCard } from "@/modules/catalog/components/ProductCard";

interface CategorySectionBlockProps {
  titulo: string;
  subtitulo: string;
  categoriaId?: number | string;
  categoriaFiltro: string;
}

export const CategorySectionBlock = ({
  titulo,
  subtitulo,
  categoriaId,
  categoriaFiltro,
}: CategorySectionBlockProps) => {
  const [products, setProducts] = useState<ProductoPadreWebDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const data = await catalogService.cargarProductosTienda();
        if (data && data.length > 0) {
          const filtrados = data.filter((p: any) => {
            // 1. Filtrado prioritario por ID de categoría
            if (categoriaId !== undefined && categoriaId !== null) {
              if (String(p.categoriaId) === String(categoriaId)) return true;
            }
            // 2. Filtrado por nombre de categoría
            if (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes(categoriaFiltro.toLowerCase())) {
              return true;
            }
            // 3. Filtrado por nombre del producto
            if (p.nombre && p.nombre.toLowerCase().includes(categoriaFiltro.toLowerCase())) {
              return true;
            }
            return false;
          });

          // 🚀 CORREGIDO: Si no hay filtrados, queda en [] (NO devuelve data completo)
          setProducts(filtrados);
        }
      } catch (error) {
        console.error(`Error cargando bloque de ${categoriaFiltro}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoriaId, categoriaFiltro]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 relative group/section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {titulo}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {subtitulo}
          </p>
        </div>

        <Link
          href={`/catalogo?categoria=${categoriaId || ""}`}
          className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-fuchsia-600 hover:text-fuchsia-700 transition-colors group self-start sm:self-auto"
        >
          <span>Ver sección completa</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* CARRUSEL DE PRODUCTOS COMPACTO ESTILO PLAZA VEA */}
      <div className="relative">
        {/* Flecha Izquierda */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-slate-800 p-2 rounded-full shadow-md border border-slate-200 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Contenedor Scrollable */}
        <div
          ref={scrollRef}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 px-1"
        >
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="min-w-44 sm:min-w-52 h-72 bg-slate-100 rounded-2xl animate-pulse shrink-0" />
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="min-w-44 sm:min-w-52 max-w-56 shrink-0">
                <ProductCard item={product} />
              </div>
            ))
          )}
        </div>

        {/* Flecha Derecha */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-slate-800 p-2 rounded-full shadow-md border border-slate-200 opacity-0 group-hover/section:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};