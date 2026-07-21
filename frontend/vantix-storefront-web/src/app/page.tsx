"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Sede {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
}

export default function SelectorSedePage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  // Definición de las sedes de Zarely
  const sedes: Sede[] = [
    {
      id: 1, // tiendaId en base de datos para Independencia
      nombre: "Sede Independencia",
      descripcion: "Variedad de útiles, oficina y accesorios en el corazón de Independencia.",
      icono: "🏬",
    },
    {
      id: 2, // tiendaId en base de datos para Dos Palmares
      nombre: "Sede Dos Palmares",
      descripcion: "Tu punto de atención alternativo con todo el stock escolar disponible.",
      icono: "🏪",
    },
  ];

  useEffect(() => {
    // Si el cliente ya eligió sede antes, va directo al catálogo
    const sedeGuardada = localStorage.getItem("vantix_tienda_id");
    if (sedeGuardada) {
      router.push("/catalogo");
    } else {
      setCargando(false);
    }
  }, [router]);

  const seleccionarSede = (id: number) => {
    localStorage.setItem("vantix_tienda_id", id.toString());
    router.push("/catalogo");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Bienvenido a <span className="text-fuchsia-600">Zarely</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Para mostrarte los precios y productos con stock en tiempo real, selecciona la tienda donde realizarás tu pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {sedes.map((sede) => (
            <button
              key={sede.id}
              onClick={() => seleccionarSede(sede.id)}
              className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left transition-all duration-300 hover:shadow-md hover:border-fuchsia-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-4xl block group-hover:scale-110 transition-transform duration-300">
                    {sede.icono}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-fuchsia-600 transition-colors">
                    {sede.nombre}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {sede.descripcion}
                  </p>
                </div>
                
                <div className="pt-2 flex items-center text-sm font-semibold text-fuchsia-600 group-hover:text-fuchsia-700">
                  Ver catálogo disponible
                  <svg 
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 pt-8">
          Vantix Ecosistema Omnicanal • Sincronización de inventario automática.
        </p>
      </div>
    </div>
  );
}