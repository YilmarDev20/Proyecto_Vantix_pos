import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Plus, Trash2, ShoppingCart, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PurchasesService } from '../services/purchases.api';
import type { ProveedorResponse, MetodoPago } from '../types/purchases.types';

import { VariantService } from '@/features/inventory/variant/services/variant.api';
import type { Variant } from '@/features/inventory/variant/types/variant.types';
import { ProductService } from '@/features/inventory/product/services/product.api';
import type { Product } from '@/features/inventory/product/types/product.types';

import { useStore } from '@/core/store/context/StoreContext';

interface NewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CartItem {
  variante: Variant;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

export const NewPurchaseModal = ({ isOpen, onClose, onSuccess }: NewPurchaseModalProps) => {
  const { activeStoreId } = useStore();

  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [variantes, setVariantes] = useState<Variant[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
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
    } else {
      setProveedorId('');
      setNumeroComprobante('');
      setMetodoPago('EFECTIVO');
      setCart([]);
      setSearchTerm('');
    }
  }, [isOpen, activeStoreId]);

  const getProductName = (productoId: number) => {
    const prod = productos.find(p => p.id === productoId);
    return prod ? prod.nombre : 'Producto Desconocido';
  };

  const addToCart = (variante: Variant) => {
    const exists = cart.find(item => item.variante.id === variante.id);
    if (exists) {
      toast.info('El producto ya está en el detalle. Puedes cambiar la cantidad allí.');
      return;
    }
    const name = getProductName(variante.productoId);
    setCart([...cart, { 
      variante, 
      productoNombre: name,
      cantidad: 1, 
      precioUnitario: variante.precioCompra || 0 
    }]);
    setSearchTerm(''); 
    // ✅ FEEDBACK SONNER INTERACTIVO
    toast.success(`"${name}" agregado al detalle de la compra`);
  };

  const removeFromCart = (varianteId: number) => {
    setCart(cart.filter(item => item.variante.id !== varianteId));
  };

  const updateCartItem = (varianteId: number, field: 'cantidad' | 'precioUnitario', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setCart(cart.map(item => 
      item.variante.id === varianteId ? { ...item, [field]: numValue } : item
    ));
  };

  const totalCompra = cart.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

  const variantesFiltradas = searchTerm.trim() === '' ? [] : variantes.filter(v => {
    const searchLower = searchTerm.toLowerCase();
    const productName = getProductName(v.productoId).toLowerCase();
    
    return (
      v.sku.toLowerCase().includes(searchLower) ||
      (v.codigoBarras && v.codigoBarras.includes(searchLower)) ||
      productName.includes(searchLower)
    );
  }).slice(0, 6); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) return toast.error('Selecciona un proveedor');
    if (cart.length === 0) return toast.error('Agrega al menos un producto a la compra');
    
    if (cart.some(item => item.precioUnitario <= 0)) {
      return toast.error('El costo unitario de los productos debe ser mayor a 0');
    }

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
      toast.success('¡Compra registrada exitosamente! El Kardex ha sido actualizado.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar la compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nueva Compra (Ingreso a Kardex)" maxWidth="5xl">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="w-full lg:w-1/3 space-y-5 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 h-fit transition-colors">
          <div className="flex items-center text-primary dark:text-blue-400 font-bold mb-4">
            <FileText className="w-5 h-5 mr-2" />
            Datos del Comprobante
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Proveedor *</label>
            <select 
              required 
              value={proveedorId} 
              onChange={(e) => setProveedorId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
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
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Pago *</label>
            <select 
              value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium transition-colors"
            >
              <option value="EFECTIVO">Efectivo (Sacar de Caja)</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CREDITO">Al Crédito (Fiado / Por Pagar)</option>
            </select>
            {metodoPago === 'CREDITO' && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                * Esta compra irá a "Cuentas por Pagar" y no restará dinero de tu caja hoy.
              </p>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Buscador y Detalle */}
        <div className="w-full lg:w-2/3 space-y-4 flex flex-col">
          
          <div className="relative z-10">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Buscar Producto para agregar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Escanea o escribe el SKU, Nombre del producto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-primary/20 dark:border-slate-700 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors"
              />
            </div>
            
            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden z-20 transition-colors">
                {variantesFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">No se encontraron productos</div>
                ) : (
                  variantesFiltradas.map(v => (
                    <div key={v.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{getProductName(v.productoId)} <span className="text-slate-500 dark:text-slate-400 font-normal">({v.sku})</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {v.stockActual} | Costo Ref: S/ {v.precioCompra.toFixed(2)}</p>
                      </div>
                      <button type="button" onClick={() => addToCart(v)} className="p-1.5 bg-blue-50 dark:bg-slate-700 text-primary dark:text-blue-300 rounded-md hover:bg-primary dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-colors">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[300px] transition-colors">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
                  <tr>
                    <th className="py-2 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Producto</th>
                    <th className="py-2 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-24">Cantidad</th>
                    <th className="py-2 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-32">Costo Unit. (S/)</th>
                    <th className="py-2 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Subtotal</th>
                    <th className="py-2 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
                  {cart.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">Busca un producto arriba para agregarlo al detalle.</td></tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.variante.id}>
                        <td className="py-2 px-4">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.productoNombre}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.variante.sku}</p>
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" min="1" required
                            value={item.cantidad || ''}
                            onChange={(e) => updateCartItem(item.variante.id, 'cantidad', e.target.value)}
                            className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-center outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" step="0.10" min="0" required
                            value={item.precioUnitario || ''}
                            onChange={(e) => updateCartItem(item.variante.id, 'precioUnitario', e.target.value)}
                            className="w-full p-1.5 border border-slate-300 dark:border-slate-700 rounded text-right outline-none focus:border-primary dark:focus:border-blue-500 font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 transition-colors"
                          />
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                          S/ {(item.cantidad * item.precioUnitario).toFixed(2)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button type="button" onClick={() => removeFromCart(item.variante.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-800 dark:bg-slate-950 text-white p-4 flex justify-between items-center transition-colors">
              <div className="flex items-center text-sm font-medium">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Total a Pagar
              </div>
              <div className="text-2xl font-black">S/ {totalCompra.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium border border-slate-200 dark:border-slate-700 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || cart.length === 0} className="px-8 py-2 bg-primary dark:bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm">
              {isSubmitting ? 'Procesando...' : 'Confirmar Compra e Ingresar Stock'}
            </button>
          </div>

        </div>
      </form>
    </Modal>
  );
};