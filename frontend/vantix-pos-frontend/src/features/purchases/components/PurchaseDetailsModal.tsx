import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ShoppingCart, FileText, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CompraResponse } from '../types/purchases.types';
import { VariantService } from '@/features/inventory/variant/services/variant.api';
import { ProductService } from '@/features/inventory/product/services/product.api';
import type { Variant } from '@/features/inventory/variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';

import { useStore } from '@/core/store/context/StoreContext';

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  compra: CompraResponse | null;
}

export const PurchaseDetailsModal = ({ isOpen, onClose, compra }: PurchaseDetailsModalProps) => {
  const { activeStoreId } = useStore();

  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && compra) {
      const loadCatalog = async () => {
        setIsLoading(true);
        try {
          const tiendaIdQuery = activeStoreId || 1;
          
          const [varsData, prodsData] = await Promise.all([
            VariantService.getAll(tiendaIdQuery),
            ProductService.getAll()
          ]);
          setVariantes(varsData);
          setProductos(prodsData);
        } catch (error) {
          console.error("Error cargando catálogo para detalles", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCatalog();
    }
  }, [isOpen, compra, activeStoreId]);

  if (!compra) return null;

  const getProductInfo = (varianteId: number) => {
    const v = variantes.find(v => v.id === varianteId);
    if (!v) return { nombre: 'Cargando...', sku: '...' };
    
    let nombreFinal = v.productoNombre || "Producto";
    
    if (nombreFinal === "Producto") {
      const prod = productos.find(p => p.id === v.productoId);
      if (prod) nombreFinal = prod.nombre;
    }

    if (v.marcaNombre) {
      nombreFinal += ` [${v.marcaNombre}]`;
    }

    if (v.atributos && Object.keys(v.atributos).length > 0) {
      const attrValues = Object.values(v.atributos).filter(Boolean).join(', ');
      if (attrValues) {
        nombreFinal += ` - ${attrValues}`;
      }
    }

    return { 
      nombre: nombreFinal, 
      sku: v.sku 
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de Compra: ${compra.numeroComprobante}`} maxWidth="3xl">
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1"><Building2 className="w-4 h-4 mr-2"/> Proveedor</div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{compra.proveedorRazonSocial}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center text-slate-500 dark:text-slate-400 mb-1"><Calendar className="w-4 h-4 mr-2"/> Fecha</div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{format(new Date(compra.fechaCompra), "dd MMM yyyy, HH:mm", { locale: es })}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 transition-colors">
            <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1"><ShoppingCart className="w-4 h-4 mr-2"/> Total Facturado</div>
            <p className="font-black text-blue-700 dark:text-blue-300 text-lg">S/ {compra.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center font-bold text-slate-700 dark:text-slate-300 transition-colors">
            <FileText className="w-4 h-4 mr-2" /> Productos Ingresados al Kardex
          </div>
          <table className="w-full text-left border-collapse bg-white dark:bg-slate-900 transition-colors">
            <thead className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Producto</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Cantidad</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Costo Unit.</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">Cargando detalles...</td></tr>
              ) : compra.detalles?.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">No hay detalles en esta compra.</td></tr>
              ) : (
                compra.detalles?.map((det, idx) => {
                  const info = getProductInfo(det.varianteId);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{info.nombre}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{info.sku}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {det.cantidad}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600 dark:text-slate-400">
                        S/ {det.precioUnitario.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">
                        S/ {(det.cantidad * det.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};