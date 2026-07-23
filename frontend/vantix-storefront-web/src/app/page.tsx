"use client";

import { useEffect, useState } from "react";
import { HeroBanner } from "@/modules/home/components/HeroBanner";
import { FeaturedProducts } from "@/modules/home/components/FeaturedProducts";
import { CategorySectionBlock } from "@/modules/home/components/CategorySectionBlock";
import { FeaturedCategories } from "@/modules/home/components/FeaturedCategories";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";
import { useWebSettings } from "@/hooks/useWebSettings";

export default function HomePage() {
  const { config } = useWebSettings();
  const [categoriasPublicas, setCategoriasPublicas] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const apiBase = envApi.endsWith("/api/v1") ? envApi : `${envApi.replace(/\/$/, "")}/api/v1`;

        // 🚀 Ruta exacta del endpoint público corregido
        const res = await fetch(`${apiBase}/public/catalog/categorias`);
        if (res.ok) {
          const data = await res.json();
          setCategoriasPublicas(data);
        }
      } catch (error) {
        console.error("Error al obtener las categorías públicas:", error);
      }
    };
    fetchCategorias();
  }, []);

  const destacadasIds = (config?.categoriasDestacadasIds || []).map((id) => String(id));
  const categoriasSeleccionadas = categoriasPublicas.filter((cat) =>
    destacadasIds.includes(String(cat.id))
  );

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. BANNER PRINCIPAL / CARRUSEL */}
        <HeroBanner />

        {/* 2. PRODUCTOS DESTACADOS */}
        <FeaturedProducts />

        {/* 3. BLOQUES DINÁMICOS POR CATEGORÍA SELECCIONADA EN EL POS */}
        {categoriasSeleccionadas.map((cat) => (
          <CategorySectionBlock
            key={cat.id}
            titulo={`Lo mejor en ${cat.nombre}`}
            subtitulo={`Explora la mejor variedad de productos en ${cat.nombre} al mejor precio.`}
            categoriaId={cat.id}
            categoriaFiltro={cat.nombre}
          />
        ))}

        {/* 4. TARJETAS DE ACCESO RÁPIDO */}
        <FeaturedCategories />
      </div>

      <CartDrawer nombreSede="Zarely Tienda Web" />
    </main>
  );
}