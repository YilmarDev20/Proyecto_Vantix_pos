import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';
import { TransfersService } from '../services/transfers.api';
import { VariantService } from '@/features/inventory/variant/services/variant.api';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { AdvancedProductSearch } from '@/components/ui/AdvancedProductSearch';
import { TransferCart } from '../components/TransferCart';

interface CartItem {
  varianteId: number;
  sku: string;
  nombreVisible: string; 
  stockDisponible: number;
  cantidadTraslado: number;
  presentacionesDisponibles: Presentacion[];
}

export const NewTransferView = () => {
  const { activeStoreId, activeStoreName, stores } = useStore();
  const { user } = useAuth();

  const [destinoId, setDestinoId] = useState<number | ''>('');
  const [notas, setNotas] = useState('');
  
  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [detallesFinales, setDetallesFinales] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      if (!activeStoreId) return;
      try {
        setIsLoadingCatalog(true);
        const data = await VariantService.getAll(activeStoreId); 
        setVariantes(data);
      } catch (error) {
        toast.error('Error al cargar el catálogo de productos');
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    loadCatalog();
    setCart([]);
  }, [activeStoreId]);

  const formatearNombreVariante = (variante: Variant) => {
    const nombreBase = variante.productoNombre || 'Producto';
    const marca = variante.marcaNombre ? ` [${variante.marcaNombre}]` : '';
    let atributosExtra = '';
    if (variante.atributos && Object.keys(variante.atributos).length > 0) {
      atributosExtra = ` - ${Object.values(variante.atributos).join(', ')}`;
    }
    return `${nombreBase}${marca}${atributosExtra}`;
  };

  const addToCart = (variante: Variant) => {
    if (variante.stockActual <= 0) {
      toast.error('No hay stock disponible para trasladar este producto');
      return;
    }

    const existingItem = cart.find(item => item.varianteId === variante.id);
    const nombreFormateado = formatearNombreVariante(variante);

    if (existingItem) {
      if (existingItem.cantidadTraslado >= variante.stockActual) {
        toast.warning(`No puedes trasladar más de las ${variante.stockActual} unidades disponibles`);
        return;
      }
      setCart(cart.map(item => item.varianteId === variante.id ? { ...item, cantidadTraslado: item.cantidadTraslado + 1 } : item));
      toast.success(`Se aumentó la cantidad de "${nombreFormateado}" en el traslado`);
    } else {
      setCart([...cart, {
        varianteId: variante.id,
        sku: variante.sku,
        nombreVisible: nombreFormateado, 
        stockDisponible: variante.stockActual,
        cantidadTraslado: 1,
        presentacionesDisponibles: variante.presentaciones || []
      }]);
      toast.success(`"${nombreFormateado}" agregado al detalle del traslado`);
    }
  };

  const updateQuantity = (varianteId: number, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.warning(`Solo tienes ${maxStock} unidades en stock`);
      return;
    }
    setCart(cart.map(item => item.varianteId === varianteId ? { ...item, cantidadTraslado: newQuantity } : item));
  };

  const removeFromCart = (varianteId: number) => setCart(cart.filter(item => item.varianteId !== varianteId));

  // 🚀 Captura los detalles del carrito con sus respectivos empaques antes de abrir la confirmación
  const handleTriggerConfirm = (detallesMapeados: any[]) => {
    setDetallesFinales(detallesMapeados);
    setIsConfirmOpen(true);
  };

  const handleSendTransfer = async () => {
    setIsConfirmOpen(false); 
    const creadorId = user?.id || 1; 

    try {
      setIsSubmitting(true);
      await TransfersService.crearTraslado({
        tiendaOrigenId: activeStoreId as number,
        tiendaDestinoId: Number(destinoId),
        usuarioCreadorId: creadorId,
        notas: notas,
        // 🚀 Envía los detalles congelados con presentacionNombre y factorConversion
        detalles: detallesFinales
      });

      toast.success('¡Traslado enviado con éxito!');
      setCart([]); setNotas(''); setDestinoId(''); setDetallesFinales([]);
      
      const data = await VariantService.getAll(activeStoreId as number); 
      setVariantes(data);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 items-start">
      
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative z-20 transition-colors">
        <div className="mb-4">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-1.5 leading-tight">
            Origen: <span className="text-primary dark:text-blue-400 font-extrabold">{activeStoreName}</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Busca y agrega variantes para transferir a otra sucursal.
          </p>
        </div>

        {isLoadingCatalog ? (
          <div className="py-6 text-center text-sm text-slate-400 font-medium animate-pulse">
            Cargando catálogo...
          </div>
        ) : (
          <AdvancedProductSearch 
            items={variantes}
            onSelectItem={addToCart}
            customFormatName={formatearNombreVariante}
            placeholder="Tipea producto, SKU o barras..."
          />
        )}
      </div>
      
      <div className="lg:col-span-8">
        <TransferCart 
          cart={cart} 
          updateQuantity={updateQuantity} 
          removeFromCart={removeFromCart}
          destinoId={destinoId} 
          setDestinoId={setDestinoId} 
          stores={stores}
          activeStoreId={activeStoreId} 
          notas={notas} 
          setNotas={setNotas}
          onSubmitTransfer={handleTriggerConfirm} 
          isSubmitting={isSubmitting}
        />
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleSendTransfer}
        title="Confirmar Traslado"
        message={`¿Estás seguro de que deseas enviar estos ${cart.length} productos a la sucursal destino? El stock se descontará inmediatamente.`}
        confirmText="Sí, Enviar Traslado"
      />
    </div>
  );
};