import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';
import { TransfersService } from '../services/transfers.api';
import { VariantService } from '@/features/inventory/variant/services/variant.api';
import type { Variant } from '@/features/inventory/variant/types/variant.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { TransferProductSearch } from '../components/TransferProductSearch';
import { TransferCart } from '../components/TransferCart';

interface CartItem {
  varianteId: number;
  sku: string;
  nombreVisible: string; 
  stockDisponible: number;
  cantidadTraslado: number;
}

export const NewTransferView = () => {
  const { activeStoreId, activeStoreName, stores } = useStore();
  const { user } = useAuth();

  const [destinoId, setDestinoId] = useState<number | ''>('');
  const [notas, setNotas] = useState('');
  
  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
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
      // ✅ FEEDBACK: Avisa que se sumó una unidad al mismo item
      toast.success(`Se aumentó la cantidad de "${nombreFormateado}" en el traslado`);
    } else {
      setCart([...cart, {
        varianteId: variante.id,
        sku: variante.sku,
        nombreVisible: nombreFormateado, 
        stockDisponible: variante.stockActual,
        cantidadTraslado: 1
      }]);
      // ✅ FEEDBACK: Avisa que el producto es nuevo en la lista
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

  const handlePreSubmit = () => setIsConfirmOpen(true);

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
        detalles: cart.map(item => ({ varianteId: item.varianteId, cantidad: item.cantidadTraslado }))
      });

      toast.success('¡Traslado enviado con éxito!');
      setCart([]); setNotas(''); setDestinoId('');
      
      const data = await VariantService.getAll(activeStoreId as number); 
      setVariantes(data);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCatalog = variantes.filter(v => {
    const terminoBusqueda = searchTerm.toLowerCase();
    const nombreCompleto = formatearNombreVariante(v).toLowerCase();
    return v.sku.toLowerCase().includes(terminoBusqueda) || nombreCompleto.includes(terminoBusqueda);
  }).slice(0, 15); 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
      <TransferProductSearch 
        activeStoreName={activeStoreName} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        isLoadingCatalog={isLoadingCatalog} filteredCatalog={filteredCatalog} addToCart={addToCart}
        formatearNombreVariante={formatearNombreVariante}
      />
      
      <TransferCart 
        cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart}
        destinoId={destinoId} setDestinoId={setDestinoId} stores={stores}
        activeStoreId={activeStoreId} notas={notas} setNotas={setNotas}
        handlePreSubmit={handlePreSubmit} isSubmitting={isSubmitting}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleSendTransfer}
        title="Confirmar Traslado"
        message={`¿Estás seguro de que deseas enviar estos ${cart.length} productos a la sucursal destino? El stock se descontará inmediatamente.`}
        confirmText="Sí, Enviar Traslado"
      />
    </div>
  );
};