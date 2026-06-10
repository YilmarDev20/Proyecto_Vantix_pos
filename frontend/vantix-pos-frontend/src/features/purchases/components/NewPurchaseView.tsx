import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Trash2, ShoppingCart, FileText, ArrowLeft, RefreshCw } from 'lucide-react';

import { PurchasesService } from '../services/purchases.api';
import type { ProveedorResponse, MetodoPago } from '../types/purchases.types';

import { VariantService } from '@/features/inventory/variant/services/variant.api';
import type { Variant } from '@/features/inventory/variant/types/variant.types';
import { ProductService } from '@/features/inventory/product/services/product.api';
import type { Product } from '@/features/inventory/product/types/product.types';

import { useStore } from '@/core/store/context/StoreContext';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'; 

interface NewPurchaseViewProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface CartItem {
  variante: Variant;
  productoNombre: string; 
  cantidad: number;
  precioUnitario: number;
}

const DRAFT_STORAGE_KEY = 'vantix_purchase_draft';

export const NewPurchaseView = ({ onCancel, onSuccess }: NewPurchaseViewProps) => {
  const { activeStoreId, activeStoreName } = useStore();

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  
  // =========================================================================
  // ---> INICIALIZACIÓN DESDE LOCALSTORAGE (Auto-recuperación) <---
  // =========================================================================
  const [proveedorId, setProveedorId] = useState<number | ''>(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved).proveedorId : '';
  });
  const [numeroComprobante, setNumeroComprobante] = useState(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved).numeroComprobante : '';
  });
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved).metodoPago : 'EFECTIVO';
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved).cart : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // =========================================================================
  // ---> GUARDADO EN VIVO (Auto-Save) <---
  // =========================================================================
  useEffect(() => {
    const draft = { proveedorId, numeroComprobante, metodoPago, cart };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [proveedorId, numeroComprobante, metodoPago, cart]);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const tiendaIdQuery = activeStoreId || 1;
        const [provsData, varsData, prodsData] = await Promise.all([
          PurchasesService.getProveedores(),
          VariantService.getAll(tiendaIdQuery),
          ProductService.getAll()
        ]);
        setProveedores(provsData.filter(p => p.estado));
        setVariantes(varsData.filter(v => v.estado));
        setProductos(prodsData);
      } catch (error) {
        toast.error('Error al cargar datos del catálogo para la compra');
      }
    };
    loadMasterData();
  }, [activeStoreId]);

  const formatVariantName = (v: Variant) => {
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
    
    return nombreFinal;
  };

  const addToCart = (variante: Variant) => {
    const exists = cart.find(item => item.variante.id === variante.id);
    if (exists) {
      toast.info('El producto ya está en el detalle. Puedes cambiar la cantidad allí.');
      return;
    }
    const nombreFormateado = formatVariantName(variante);
    setCart([...cart, { 
      variante, 
      productoNombre: nombreFormateado, 
      cantidad: 1, 
      precioUnitario: variante.precioCompra || 0 
    }]);
    setSearchTerm(''); 
    // ✅ FEEDBACK INTERACTIVO EN EL AGREGAR
    toast.success(`"${nombreFormateado}" agregado al detalle de la compra`);
  };

  const removeFromCart = (varianteId: number) => {
    setCart(cart.filter(item => item.variante.id !== varianteId));
  };

  const clearDraft = () => {
    setProveedorId('');
    setNumeroComprobante('');
    setMetodoPago('EFECTIVO');
    setCart([]);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.success('Borrador limpiado correctamente');
  };

  const updateCartItem = (varianteId: number, field: 'cantidad' | 'precioUnitario' | 'subtotal', value: string) => {
    if (value === '') {
      setCart(cart.map(item => item.variante.id === varianteId ? { ...item, [field === 'subtotal' ? 'precioUnitario' : field]: 0 } : item));
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setCart(cart.map(item => {
      if (item.variante.id !== varianteId) return item;

      if (field === 'cantidad') {
        return { ...item, cantidad: numValue };
      } else if (field === 'precioUnitario') {
        return { ...item, precioUnitario: numValue };
      } else if (field === 'subtotal') {
        const nuevoCostoUnitario = item.cantidad > 0 ? numValue / item.cantidad : 0;
        return { ...item, precioUnitario: nuevoCostoUnitario };
      }
      return item;
    }));
  };

  const totalCompra = cart.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

  const variantesFiltradas = searchTerm.trim() === '' ? [] : variantes.filter(v => {
    const searchLower = searchTerm.toLowerCase();
    const formattedName = formatVariantName(v).toLowerCase();
    
    return (
      v.sku.toLowerCase().includes(searchLower) ||
      (v.codigoBarras && v.codigoBarras.includes(searchLower)) ||
      formattedName.includes(searchLower) 
    );
  }).slice(0, 8); 

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) return toast.error('Selecciona un proveedor');
    if (cart.length === 0) return toast.error('Agrega al menos un producto a la compra');
    
    if (cart.some(item => item.precioUnitario <= 0)) {
      return toast.error('El costo unitario de los productos debe ser mayor a 0');
    }

    setIsConfirmModalOpen(true);
  };

  const executePurchase = async () => {
    try {
      setIsSubmitting(true);
      await PurchasesService.registrarCompra({
        proveedorId: Number(proveedorId),
        numeroComprobante,
        metodoPago,
        total: totalCompra,
        tiendaId: activeStoreId || 1, 
        usuarioId: 1,
        detalles: cart.map(item => ({
          varianteId: item.variante.id,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        }))
      });
      
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success('¡Compra registrada exitosamente! El Kardex ha sido actualizado.');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Registrar Nueva Compra</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ingresa los datos de la factura y los productos para actualizar el Kardex.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {cart.length > 0 && (
            <button 
              type="button"
              onClick={clearDraft} 
              className="flex items-center px-4 py-2 text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg font-bold transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpiar Borrador
            </button>
          )}
          <button 
            type="button"
            onClick={onCancel} 
            className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Historial
          </button>
        </div>
      </div>

      <form onSubmit={handlePreSubmit} className="flex flex-col lg:flex-row gap-6">
        
        {/* COLUMNA IZQUIERDA: Comprobante */}
        <div className="w-full lg:w-1/3 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit sticky top-4 transition-colors">
          <div className="flex items-center text-primary dark:text-blue-400 font-bold mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-5 h-5 mr-2" />
            Datos del Comprobante
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Proveedor *</label>
            <select 
              required 
              value={proveedorId} 
              onChange={(e) => setProveedorId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
            >
              <option value="">-- Seleccionar --</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.documento} - {p.razonSocial}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">N° Comprobante (Factura/Boleta) *</label>
            <input 
              type="text" required placeholder="Ej: F001-000458"
              value={numeroComprobante} onChange={(e) => setNumeroComprobante(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Pago *</label>
            <select 
              value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-medium transition-colors"
            >
              <option value="EFECTIVO">Efectivo (Sacar de Caja)</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CREDITO">Al Crédito (Fiado / Por Pagar)</option>
            </select>
          </div>
        </div>

        {/* COLUMNA DERECHA: Buscador y Carrito */}
        <div className="w-full lg:w-2/3 space-y-4 flex flex-col">
          <div className="relative z-10 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Buscar Producto para agregar</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Escanea o escribe el SKU, Nombre, Capacidad, Color..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
              />
            </div>
            
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 transition-colors">
                {variantesFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">No se encontraron productos</div>
                ) : (
                  variantesFiltradas.map(v => (
                    <div key={v.id} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{formatVariantName(v)}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          SKU: <span className="font-bold">{v.sku}</span> | Stock: <span className="font-bold text-slate-700 dark:text-slate-300">{v.stockActual}</span> | Costo: S/ {v.precioCompra.toFixed(2)}
                        </p>
                      </div>
                      <button type="button" onClick={() => addToCart(v)} className="p-2 bg-blue-50 dark:bg-slate-700 text-primary dark:text-blue-400 rounded-lg hover:bg-primary dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden flex flex-col min-h-[400px] transition-colors">
            <div className="overflow-x-auto flex-1 p-4">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase rounded-l-lg">Producto</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center w-24">Stock</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-28 text-center">Cantidad</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-32 text-center">Costo Unit.</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-32 text-center">Subtotal</th>
                    <th className="py-3 px-4 rounded-r-lg w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                        <ShoppingCart className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
                        Busca un producto arriba para agregarlo al detalle.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.variante.id}>
                        <td className="py-3 px-4">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.productoNombre}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.variante.sku}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-md text-xs border border-transparent dark:border-slate-700">
                            {item.variante.stockActual}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input 
                            type="number" min="1" required
                            value={item.cantidad || ''}
                            onChange={(e) => updateCartItem(item.variante.id, 'cantidad', e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-center outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold transition-colors"
                          />
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">S/</span>
                            <input 
                              type="number" step="any" min="0" required
                              value={item.precioUnitario || ''}
                              onChange={(e) => updateCartItem(item.variante.id, 'precioUnitario', e.target.value)}
                              className="w-full pl-6 pr-2 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-right outline-none focus:border-primary dark:focus:border-blue-500 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 transition-colors"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600/60 dark:text-emerald-400/50 font-bold text-xs">S/</span>
                            <input 
                              type="number" step="any" min="0" required
                              value={(item.cantidad * item.precioUnitario) || ''}
                              onChange={(e) => updateCartItem(item.variante.id, 'subtotal', e.target.value)}
                              className="w-full pl-6 pr-2 py-2 border border-emerald-200 dark:border-emerald-800 rounded-lg text-right outline-none focus:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 font-black text-emerald-800 dark:text-emerald-300 shadow-sm transition-colors"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button type="button" onClick={() => removeFromCart(item.variante.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 flex justify-between items-center border-t border-slate-800 transition-colors">
              <div className="flex items-center text-lg font-medium text-slate-300 dark:text-slate-400">
                <ShoppingCart className="w-6 h-6 mr-3 text-slate-400" />
                Total de Factura
              </div>
              <div className="text-3xl font-black text-emerald-400">S/ {totalCompra.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || cart.length === 0} 
              className="px-8 py-4 bg-primary dark:bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors w-full sm:w-auto shadow-md shadow-blue-500/20 border border-transparent"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Compra e Ingresar Stock'}
            </button>
          </div>

        </div>
      </form>

      <ConfirmDialog 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={executePurchase} 
        title="Confirmar Ingreso a Kardex" 
        message={`¿Estás seguro de registrar esta compra por S/ ${totalCompra.toFixed(2)}? Se actualizará el stock de ${cart.length} producto(s) en la sucursal: ${activeStoreName}.`} 
        confirmText="Sí, Registrar Compra"
        cancelText="Revisar de nuevo"
        isDestructive={false}
      />
    </div>
  );
};