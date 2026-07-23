"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { useWebSettings } from "@/hooks/useWebSettings";

export const FeaturedCategories = () => {
  const { config } = useWebSettings();
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const apiBase = envApi.endsWith("/api/v1") ? envApi : `${envApi.replace(/\/$/, "")}/api/v1`;

        const res = await fetch(`${apiBase}/public/categorias`);
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.warn("Error al cargar categorías públicas:", error);
      }
    };
    fetchCategorias();
  }, []);

  const destacadasIds = (config?.categoriasDestacadasIds || []).map((id) => String(id));
  const categoriasAMostrar = categorias.filter((c) => destacadasIds.includes(String(c.id)));

  if (categoriasAMostrar.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Categorías Principales
          </h2>
          <p className="text-xs text-slate-500">
            Encuentra rápidamente lo que buscas para tu negocio u hogar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categoriasAMostrar.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogo?categoria=${cat.id}`}
            className="p-5 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white shadow-xs text-fuchsia-600">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-fuchsia-600 text-white">
                  Destacado
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {cat.nombre}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Explora nuestra selección exclusiva de productos de {cat.nombre}.
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};