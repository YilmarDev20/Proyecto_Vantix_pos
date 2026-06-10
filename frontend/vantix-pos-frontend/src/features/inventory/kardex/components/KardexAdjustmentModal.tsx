import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { VariantService } from '../../variant/services/variant.api';
import { ProductService } from '@/features/inventory/product/services/product.api';
import { KardexService } from '../services/kardex.api';
import type { Variant } from '../../variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';
import type { AjusteInventario, OrigenMovimiento } from '../types/kardex.types';

import { VariantSearch } from './VariantSearch';
import { AdjustmentTable } from './AdjustmentTable';

import { useStore } from '@/core/store/context/StoreContext';
import { Store } from 'lucide-react';

interface KardexAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const KardexAdjustmentModal = ({ isOpen, onClose, onSuccess }: KardexAdjustmentModalProps) => {
  const { activeStoreId, activeStoreName } = useStore();

  const [variants, setVariants] = useState<Variant[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [origen, setOrigen] = useState<OrigenMovimiento>('AJUSTE_MANUAL');
  const [items, setItems] = useState<(AjusteInventario & { variant: Variant })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadCatalog = async () => {
        try {
          const tiendaIdQuery = activeStoreId || 1;
          const [varsData, prodsData] = await Promise.all([
            VariantService.getAll(tiendaIdQuery),
            ProductService.getAll()
          ]);
          setVariants(varsData);
          setProductos(prodsData);
        } catch (error) {
          toast.error('Error al cargar catálogo de productos');
        }
      };
      loadCatalog();
      setItems([]);
      setOrigen('AJUSTE_MANUAL');
    }
  }, [isOpen, activeStoreId]);

  const formatearNombreCompleto = (v: Variant) => {
    let nombre = v.productoNombre || 'Sin nombre';
    if (nombre === 'Sin nombre') {
      const prod = productos.find(p => p.id === v.productoId);
      if (prod) nombre = prod.nombre;
    }
    if (v.marcaNombre && v.marcaNombre.trim() !== '') {
      nombre += ` [${v.marcaNombre}]`;
    }
    if (v.atributos && Object.keys(v.atributos).length > 0) {
      const valores = Object.values(v.atributos).filter(val => val !== null && val !== '').join(' ');
      if (valores) {
        nombre += ` - ${valores}`;
      }
    }
    return nombre;
  };

  const handleAddVariant = (variant: Variant) => {
    if (items.some(i => i.varianteId === variant.id)) {
      toast.info('El producto ya está en la lista de ajuste.');
      return;
    }
    setItems([...items, { varianteId: variant.id, tipoMovimiento: 'ENTRADA', cantidad: 1, notas: '', variant }]);
  };

  const handleUpdateItem = (index: number, field: keyof AjusteInventario, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Agrega al menos un producto para ajustar.');
      return;
    }

    for (const item of items) {
      if (item.tipoMovimiento === 'SALIDA' && item.cantidad > item.variant.stockActual) {
        toast.error(`Stock insuficiente para retirar ${item.cantidad} de ${item.variant.sku}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        tiendaId: activeStoreId || 1,
        origen,
        ajustes: items.map(({ varianteId, tipoMovimiento, cantidad, notas }) => ({
          varianteId, tipoMovimiento, cantidad, notas
        }))
      };

      await KardexService.procesarAjusteMasivo(payload);
      toast.success('¡Inventario actualizado correctamente!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al guardar el ajuste de inventario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-slate-800 dark:text-slate-100">Ajuste Masivo de Inventario</span>
      <span className="flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/50 text-[11px] font-black uppercase tracking-widest shadow-sm transition-colors">
        <Store className="w-3.5 h-3.5 mr-1.5 shrink-0" />
        {activeStoreName}
      </span>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modalTitle}
      maxWidth="4xl"
    >
      <div className="flex flex-col w-full h-full md:h-auto md:min-h-[500px]">
        
        {/* Selector de Origen */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 mb-3 transition-colors">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Motivo del movimiento</label>
          <select 
            value={origen} 
            onChange={(e) => setOrigen(e.target.value as OrigenMovimiento)}
            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 font-bold text-sm text-slate-800 dark:text-slate-200 transition-colors"
          >
            <option value="INVENTARIO_INICIAL">Inventario Inicial (Carga de la tienda)</option>
            <option value="AJUSTE_MANUAL">Ajuste Manual (Mermas, fin de mes)</option>
            <option value="COMPRA">Ingreso por Compra Externa</option>
            <option value="DEVOLUCION">Devolución a Tienda</option>
          </select>
        </div>

        <div className="relative z-50 shrink-0 mb-3">
          <VariantSearch 
            variants={variants} 
            onAddVariant={handleAddVariant} 
            formatName={formatearNombreCompleto} 
          />
        </div>

        {/* Contenedor de la tabla */}
        <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 min-h-[250px] transition-colors">
          <AdjustmentTable 
            items={items} 
            onUpdateItem={handleUpdateItem} 
            onRemoveItem={handleRemoveItem} 
            formatName={formatearNombreCompleto} 
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 gap-2 sm:gap-0 shrink-0 transition-colors">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isSubmitting || items.length === 0}
            className="w-full sm:w-auto px-8 py-3 bg-primary dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? 'Procesando...' : `Confirmar y Guardar (${items.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
};