"use client";

import { useEffect, useState } from "react";
import { catalogService } from "../services/catalog.service";
import { ProductoPadreWebDTO, CategoriaPublicaDTO } from "../types/catalog.types";
import { CategoryBar } from "../components/CategoryBar";
import { ProductCard } from "../components/ProductCard";
import { CartDrawer } from "../../cart/components/CartDrawer";

export default function CatalogPage() {
  const [productos, setProductos] = useState<ProductoPadreWebDTO[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoPadreWebDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPublicaDTO[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        // 🚀 Carga Omnicanal Unificada (todas las sedes)
        const [dataProductos, dataCategorias] = await Promise.all([
          catalogService.cargarProductosTienda(),
          catalogService.cargarCategoriasPublicas()
        ]);
        setProductos(dataProductos);
        setProductosFiltrados(dataProductos);
        setCategorias(dataCategorias);
      } catch (error) {
        console.error("Error cargando el catálogo omnicanal:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    let resultado = [...productos];
    if (categoriaSeleccionada !== null) {
      resultado = resultado.filter((p) => p.categoriaId === categoriaSeleccionada);
    }
    const query = busqueda.toLowerCase().trim();
    if (query) {
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          (p.marca && p.marca.toLowerCase().includes(query)) ||
          (p.variantes && p.variantes.some((v) => v.sku.toLowerCase().includes(query)))
      );
    }
    setProductosFiltrados(resultado);
  }, [busqueda, categoriaSeleccionada, productos]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-fuchsia-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar útiles, marcas, cuadernos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-800 focus:ring-2 focus:ring-fuchsia-500 outline-hidden text-sm"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
        </div>

        <CategoryBar
          categorias={categorias}
          categoriaSeleccionada={categoriaSeleccionada}
          onSelectCategory={setCategoriaSeleccionada}
        />

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto">
            <p className="text-3xl">📦</p>
            <h3 className="text-lg font-bold text-slate-700 mt-2">No se encontraron productos</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productosFiltrados.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* CARRITO DESPLEGABLE */}
      <CartDrawer nombreSede="Zarely Tienda Web" />
    </div>
  );
}