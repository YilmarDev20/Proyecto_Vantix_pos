"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { catalogService } from "../services/catalog.service";
import { CatalogoWebResponseDTO } from "../types/catalog.types";

export default function CatalogPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<CatalogoWebResponseDTO[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<CatalogoWebResponseDTO[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [nombreSede, setNombreSede] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tiendaIdStr = localStorage.getItem("vantix_tienda_id");
    if (!tiendaIdStr) {
      router.push("/");
      return;
    }

    const tiendaId = parseInt(tiendaIdStr, 10);
    setNombreSede(tiendaId === 1 ? "Sede Independencia" : "Sede Dos Palmares");

    const cargarDatos = async () => {
      try {
        const data = await catalogService.cargarProductosTienda(tiendaId);
        setProductos(data);
        setProductosFiltrados(data);
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [router]);

  useEffect(() => {
    const query = busqueda.toLowerCase().trim();
    if (!query) {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(
        (p) =>
          p.productoNombre.toLowerCase().includes(query) ||
          (p.marcaNombre && p.marcaNombre.toLowerCase().includes(query))
      );
      setProductosFiltrados(filtrados);
    }
  }, [busqueda, productos]);

  const cambiarSede = () => {
    localStorage.removeItem("vantix_tienda_id");
    router.push("/");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <span className="text-2xl font-black tracking-wider text-fuchsia-600">ZARELY</span>
            <span className="text-xs block text-slate-400 font-medium -mt-1">Catálogo Web</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block font-medium">Estás viendo el stock de:</span>
              <span className="text-sm font-bold text-slate-700">{nombreSede}</span>
            </div>
            <button
              onClick={cambiarSede}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg font-semibold transition-colors"
            >
              Cambiar Sede 🔄
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar útiles, marcas, cuadernos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all text-sm sm:text-base"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto">
            <p className="text-3xl">📦</p>
            <h3 className="text-lg font-bold text-slate-700 mt-2">No se encontraron productos</h3>
            <p className="text-sm text-slate-400 px-4 mt-1">
              Prueba escribiendo otra palabra o verifica si estás buscando en la sede correcta.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productosFiltrados.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="bg-slate-100 aspect-square w-full relative flex items-center justify-center text-slate-300 overflow-hidden">
                  {item.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imagenUrl}
                      alt={item.productoNombre}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-4xl">📎</span>
                  )}
                  {item.precioOferta && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Oferta
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    {item.marcaNombre && (
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-fuchsia-500 block">
                        {item.marcaNombre}
                      </span>
                    )}
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 leading-tight">
                      {item.productoNombre}
                    </h2>
                  </div>

                  <div className="pt-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-base sm:text-xl font-black text-slate-900">
                        S/ {(item.precioOferta ?? item.precioVenta).toFixed(2)}
                      </span>
                      {item.precioOferta && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                          S/ {item.precioVenta.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {item.precioMayorista && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                        Por mayor: S/ {item.precioMayorista.toFixed(2)} (x{item.cantidadMayorista})
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-0">
                  <button className="w-full bg-slate-900 hover:bg-fuchsia-600 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors duration-200 flex items-center justify-center space-x-1">
                    <span>Agregar</span>
                    <span>🛒</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}