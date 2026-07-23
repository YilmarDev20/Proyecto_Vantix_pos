"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { ProductoPadreWebDTO } from "@/modules/catalog/types/catalog.types";
import { ProductCard } from "@/modules/catalog/components/ProductCard";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<ProductoPadreWebDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        // Usamos el servicio centralizado que ya funciona en la página de catálogo
        const data = await catalogService.cargarProductosTienda(1);
        if (data && data.length > 0) {
          setProducts(data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="space-y-6 pt-4">
      {/* CABECERA DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-fuchsia-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Lo más buscado</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Productos Destacados
          </h2>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center space-x-2 text-sm font-extrabold text-fuchsia-600 hover:text-fuchsia-700 transition-colors group"
        >
          <span>Ver todo el catálogo</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* GRID DE PRODUCTOS */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 italic text-center py-8">
          No hay productos disponibles por el momento.
        </p>
      )}
    </section>
  );
};