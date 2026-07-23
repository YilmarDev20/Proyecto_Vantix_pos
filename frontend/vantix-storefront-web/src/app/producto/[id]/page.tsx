"use client";

import { useEffect, useState, use } from "react";
import { catalogService } from "@/modules/catalog/services/catalog.service";
import { ProductoPadreWebDTO } from "@/modules/catalog/types/catalog.types";
import { ProductDetailView } from "@/modules/product/components/ProductDetailView";
import { CartDrawer } from "@/modules/cart/components/CartDrawer";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);

  const [product, setProduct] = useState<ProductoPadreWebDTO | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);
        // 🚀 Carga omnicanal unificada (sin restringir a una sola tienda)
        const data = await catalogService.obtenerProductoPorId(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [productId]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-fuchsia-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Producto no encontrado</h2>
        <p className="text-sm text-slate-400 mt-1">El producto solicitado no está disponible o no existe.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🚀 Se eliminó el CatalogHeader duplicado */}
      <ProductDetailView product={product} />
      <CartDrawer nombreSede="Zarely Tienda Web" />
    </div>
  );
}