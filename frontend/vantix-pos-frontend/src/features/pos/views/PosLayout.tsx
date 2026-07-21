import { useEffect, useState } from 'react';
import { Lock, ShoppingBag, ShoppingCart, Store, Barcode, LayoutGrid } from 'lucide-react'; 
import { toast } from 'sonner';

import { FinancesService } from '@/features/finances/services/finances.api';
import type { TurnoCajaResponse } from '@/features/finances/types/finances.types';

import { VariantService } from '@/features/inventory/variant/services/variant.api';
import { ProductService } from '@/features/inventory/product/services/product.api';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import type { Product } from '@/features/inventory/product/types/product.types';

import { QuotesService } from '@/features/history/services/quotes.api'; 

import { useCart } from '../hooks/useCart';
import { PosSearchBar } from '../components/PosSearchBar';
import { CartItemList } from '../components/CartItemList';
import { CustomerSelector } from '../components/CustomerSelector';
import { CartSummary } from '../components/CartSummary';
import { CheckoutModal } from '../components/CheckoutModal';

import { TicketSuccessModal } from '../components/TicketSuccessModal'; 
import { QuoteSuccessModal } from '../components/QuoteSuccessModal'; 

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PresentationSelectionModal } from '../components/PresentationSelectionModal';
import { PosCatalogBrowser } from '../components/PosCatalogBrowser';
import type { VentaResponse } from '../types/pos.types';

import { useStore } from '@/core/store/context/StoreContext';

const POS_MODE_STORAGE_KEY = 'vantix_pos_preferred_mode';

export const PosLayout = () => {
  const { activeStoreId } = useStore();

  const [turnoActivo, setTurnoActivo] = useState<TurnoCajaResponse | null>(null);
  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isExitEditModalOpen, setIsExitEditModalOpen] = useState(false);
  
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [selectedVariantForModal, setSelectedVariantForModal] = useState<Variant | null>(null);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isQuoteSuccessOpen, setIsQuoteSuccessOpen] = useState(false);

  const [lastVenta, setLastVenta] = useState<VentaResponse | null>(null);
  const [lastVuelto, setLastVuelto] = useState(0);
  const [lastPagoRecibido, setLastPagoRecibido] = useState(0);
  const [cartClone, setCartClone] = useState<any[]>([]); 

  const [activeMobileTab, setActiveMobileTab] = useState<'CATALOG' | 'CART'>('CATALOG');
  
  const [posMode, setPosMode] = useState<'SCANNER' | 'CATALOG'>(() => {
    return (localStorage.getItem(POS_MODE_STORAGE_KEY) as 'SCANNER' | 'CATALOG') || 'SCANNER';
  });

  const cart = useCart(productos);

  const handleModeChange = (mode: 'SCANNER' | 'CATALOG') => {
    setPosMode(mode);
    localStorage.setItem(POS_MODE_STORAGE_KEY, mode);
  };

  useEffect(() => {
    const initializePos = async () => {
      if (activeStoreId === null) {
        setIsLoading(false);
        return; 
      }

      try {
        setIsLoading(true);
        const turno = await FinancesService.getTurnoActivo(activeStoreId);
        setTurnoActivo(turno);

        if (turno) {
          const [varsData, prodsData] = await Promise.all([
            VariantService.getAll(activeStoreId),
            ProductService.getAll()
          ]);
          setVariantes(varsData.filter(v => v.estado));
          setProductos(prodsData);
        }
      } catch (error) {
        toast.error('Error al iniciar el Punto de Venta');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePos();
  }, [activeStoreId]); 

  const handleVentaSuccess = (venta: VentaResponse, vuelto: number, pagoRecibido: number) => {
    setLastVenta(venta);
    setLastVuelto(vuelto);
    setLastPagoRecibido(pagoRecibido);
    setCartClone([...cart.items]); 
    setIsCheckoutOpen(false);

    if (venta.tipoComprobante === 'COTIZACION') {
      setIsQuoteSuccessOpen(true);
    } else {
      setIsSuccessOpen(true);
    }
    
    cart.clearCart(); 
    setActiveMobileTab('CATALOG'); 
  };

  const handleStartNewSale = () => {
    setIsSuccessOpen(false);
    setIsQuoteSuccessOpen(false); 
    setLastVenta(null);
    setCartClone([]);
  };

  const handleOpenPresentationModal = (variante: Variant) => {
    setSelectedVariantForModal(variante);
    setIsPresentationModalOpen(true);
  };

  const handleSelectPresentation = (variante: Variant, presentacion?: Presentacion) => {
    cart.addItem(variante, presentacion);
    setIsPresentationModalOpen(false);
    setSelectedVariantForModal(null);
    toast.success('Agregado a la canasta', { duration: 1000 });
  };

  const handleUpdateQuote = async () => {
    if (!cart.cotizacionActiva) return;
    if (cart.items.length === 0) return toast.error('La canasta está vacía.');
    if (!cart.cliente) return toast.error('Debe seleccionar un cliente.');

    try {
      toast.loading('Guardando cambios...', { id: 'update-quote' });
      
      const payload = {
        tiendaId: activeStoreId || 1, 
        usuarioId: 1,
        turnoCajaId: turnoActivo?.id,
        clienteId: cart.cliente.id,
        tipoComprobante: 'COTIZACION',
        subtotal: cart.subtotal,
        descuentoTotal: cart.descuentoGlobal,
        totalFinal: cart.totalFinal,
        pagoRecibido: 0,
        vuelto: 0,
        observaciones: cart.observaciones,
        pagos: [], 
        detalles: cart.items.map(i => ({
          varianteId: i.variante.id,
          presentacionId: i.presentacion?.id || null, 
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuentoUnitario: i.descuentoUnitario,
          subtotal: i.subtotal
        }))
      };

      await QuotesService.actualizarCotizacion(cart.cotizacionActiva, payload);
      toast.success('Cotización actualizada correctamente.', { id: 'update-quote' });
      cart.clearCart(); 
      setActiveMobileTab('CATALOG');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la cotización.', { id: 'update-quote' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeStoreId === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 p-6 text-center animate-in fade-in zoom-in-95 duration-500 transition-colors">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-slate-900 transition-colors">
          <Store className="w-10 h-10 text-primary dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">Visión Global Activa</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Por seguridad de tu inventario, <b>no es posible registrar ventas en el modo global</b>.
          <br /><br />
          Por favor, selecciona una tienda específica en el menú superior para empezar a vender.
        </p>
      </div>
    );
  }

  if (!turnoActivo) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-950 p-6 text-center animate-in fade-in duration-500 transition-colors">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white dark:border-slate-900 transition-colors">
          <Lock className="w-10 h-10 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3">Caja Cerrada</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Para poder registrar ventas, necesitas tener un turno de caja abierto en tu sucursal.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative pb-16 lg:pb-0 overflow-hidden transition-colors duration-200"> 
      
      <div className="flex flex-col lg:flex-row h-full gap-4 animate-in fade-in duration-300">
        
        {/* ================================================== */}
        {/* PANEL IZQUIERDO (Buscador / Catálogo / Grilla) */}
        {/* ================================================== */}
        <div className={`w-full flex-col bg-white dark:bg-slate-900 lg:rounded-2xl shadow-sm border-0 lg:border border-slate-200 dark:border-slate-800 overflow-hidden ${activeMobileTab === 'CART' ? 'hidden lg:flex' : 'flex h-full'} ${posMode === 'CATALOG' ? 'lg:w-[50%] xl:w-[55%]' : 'lg:w-[65%] xl:w-[70%]'}`}>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center z-20 shadow-sm shrink-0 transition-colors">
             <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-primary dark:text-blue-400" />
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 hidden sm:block">Punto de Venta</h2>
             </div>

             <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl shadow-inner transition-colors">
                <button 
                  type="button"
                  onClick={() => handleModeChange('SCANNER')} 
                  className={`px-4 py-2 flex items-center rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    posMode === 'SCANNER' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Barcode className="w-4 h-4 mr-2"/> <span className="hidden sm:inline">Modo</span> Escáner
                </button>
                <button 
                  type="button"
                  onClick={() => handleModeChange('CATALOG')} 
                  className={`px-4 py-2 flex items-center rounded-lg font-bold text-xs sm:text-sm transition-all ${
                    posMode === 'CATALOG' 
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2"/> <span className="hidden sm:inline">Modo</span> Catálogo
                </button>
             </div>
          </div>

          {posMode === 'SCANNER' ? (
             <>
               <PosSearchBar 
                 variantes={variantes} 
                 productos={productos} 
                 onAddProduct={cart.addItem} 
                 onOpenPresentationModal={handleOpenPresentationModal} 
               />
               <div className="flex-1 overflow-y-auto">
                  {/* 🚀 ENLAZADO: Agregada prop onChangePresentation en modo Escáner */}
                  <CartItemList 
                    items={cart.items} 
                    productos={productos}
                    onUpdateQuantity={cart.updateQuantity}
                    onRemoveItem={cart.removeItem}
                    onChangePresentation={cart.changePresentation}
                    onClearCart={cart.clearCart} 
                  />
               </div>
             </>
          ) : (
             <PosCatalogBrowser 
                variantes={variantes}
                productos={productos}
                onAddProduct={cart.addItem}
                onOpenPresentationModal={handleOpenPresentationModal}
             />
          )}
        </div>

        {/* ================================================== */}
        {/* PANEL DERECHO (Asignación de Cliente y Canasta) */}
        {/* ================================================== */}
        <div className={`w-full flex flex-col bg-white dark:bg-slate-900 lg:rounded-2xl shadow-xl relative ${activeMobileTab === 'CATALOG' ? 'hidden lg:flex' : 'flex h-full'} ${posMode === 'CATALOG' ? 'lg:w-[50%] xl:w-[45%]' : 'lg:w-[35%] xl:w-[30%]'}`}>
          
          <div className="p-5 z-40 bg-white dark:bg-slate-900 relative shrink-0 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
             <CustomerSelector selectedCustomer={cart.cliente} onSelectCustomer={cart.setCliente} />
          </div>
          
          {posMode === 'CATALOG' && (
             <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950/30 min-h-[200px] transition-colors">
                {/* 🚀 ENLAZADO: Agregada prop onChangePresentation en el panel derecho del modo Catálogo */}
                <CartItemList 
                    items={cart.items} 
                    productos={productos}
                    onUpdateQuantity={cart.updateQuantity}
                    onRemoveItem={cart.removeItem}
                    onChangePresentation={cart.changePresentation}
                    onClearCart={cart.clearCart} 
                 />
             </div>
          )}

          <div className={`${posMode === 'CATALOG' ? 'shrink-0' : 'flex-1 flex flex-col justify-end'} bg-slate-900 lg:rounded-t-[2rem] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] overflow-hidden relative z-30`}>
            <CartSummary 
              subtotal={cart.subtotal}
              descuentoGlobal={cart.descuentoGlobal}
              totalFinal={cart.totalFinal}
              itemsCount={cart.items.length}
              cotizacionActiva={cart.cotizacionActiva}
              hasStockErrors={cart.hasStockErrors}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              onRequestExitEditMode={() => setIsExitEditModalOpen(true)}
              onUpdateQuote={handleUpdateQuote} 
              isCompactMode={posMode === 'CATALOG'} 
            />
          </div>
        </div>

      </div>

      {/* NAVEGACIÓN MÓVIL */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex lg:hidden z-40 transition-colors">
        <button 
          type="button"
          onClick={() => setActiveMobileTab('CATALOG')}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 ${activeMobileTab === 'CATALOG' ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <ShoppingBag className={`w-6 h-6 ${activeMobileTab === 'CATALOG' ? 'fill-blue-50 dark:fill-slate-800' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Catálogo</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveMobileTab('CART')}
          className={`flex-1 flex flex-col items-center justify-center space-y-1 relative ${activeMobileTab === 'CART' ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <div className="relative">
             <ShoppingCart className={`w-6 h-6 ${activeMobileTab === 'CART' ? 'fill-blue-50 dark:fill-slate-800' : ''}`} />
             {cart.items.length > 0 && (
               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                 {cart.items.length}
               </span>
             )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Canasta / Caja</span>
        </button>
      </div>

      {/* MODALES OPERATIVOS */}
      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}
          cart={cart} turnoActivo={turnoActivo!} onSuccess={handleVentaSuccess} 
        />
      )}

      <PresentationSelectionModal 
        isOpen={isPresentationModalOpen} 
        onClose={() => setIsPresentationModalOpen(false)}
        variante={selectedVariantForModal}
        producto={productos.find(p => p.id === selectedVariantForModal?.productoId) || null}
        onSelect={handleSelectPresentation}
      />

      <TicketSuccessModal 
        isOpen={isSuccessOpen} venta={lastVenta} vuelto={lastVuelto}
        pagoRecibido={lastPagoRecibido} cartClone={cartClone} onNewSale={handleStartNewSale}
      />

      <QuoteSuccessModal 
        isOpen={isQuoteSuccessOpen} cotizacion={lastVenta} 
        cartClone={cartClone} onNewSale={handleStartNewSale}
      />

      <ConfirmDialog 
        isOpen={isExitEditModalOpen} 
        onClose={() => setIsExitEditModalOpen(false)} 
        onConfirm={() => {
          cart.clearCart();
          setIsExitEditModalOpen(false);
          toast.info('Se canceló la edición de la cotización.');
        }} 
        title="Salir del Modo Edición" 
        message={`¿Estás seguro de salir de la cotización de ${cart.cliente?.nombreCompleto || 'este cliente'}? Se perderán los cambios.`} 
        isDestructive={true} 
      />

    </div>
  );
};