import { useState, useMemo, useEffect } from 'react';
import type { Variant, Presentacion } from '@/features/inventory/variant/types/variant.types';
import type { Customer } from '@/features/customers/types/customer.types';
import type { PagoVentaReq, MetodoPagoVenta } from '../types/pos.types';
import type { Product } from '@/features/inventory/product/types/product.types';
import { toast } from 'sonner';

export interface CartItem {
  variante: Variant;
  presentacion?: Presentacion; 
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario: number;
  subtotal: number;
  
  packAplicado?: string; 
  packBaseName?: string; 
  precioOriginal?: number; 
}

const CART_STORAGE_KEY = 'vantix_pos_cart';

export const useCart = (productos: Product[] = []) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved).items : [];
  });
  
  const [cliente, setCliente] = useState<Customer | null>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved).cliente : null;
  });

  const [descuentoGlobal, setDescuentoGlobal] = useState<number>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved).descuentoGlobal : 0;
  });

  const [cotizacionActiva, setCotizacionActiva] = useState<number | null>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved).cotizacionActiva : null;
  });

  const [pagos, setPagos] = useState<PagoVentaReq[]>([]);
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    const dataToSave = { items, cliente, descuentoGlobal, cotizacionActiva };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [items, cliente, descuentoGlobal, cotizacionActiva]);

  useEffect(() => {
    if (productos.length > 0 && items.length > 0) {
      setItems((prev) => recalcularPacksSurtidos(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos]); 

  const recalcularPacksSurtidos = (currentItems: CartItem[]): CartItem[] => {
    if (productos.length === 0) return currentItems; 

    let nuevosItems = [...currentItems];

    const agrupadosPorProducto = nuevosItems.reduce((acc, item, index) => {
      if (item.presentacion) return acc; 
      
      const prodId = item.variante.productoId;
      if (!acc[prodId]) acc[prodId] = { itemsIndices: [], totalCantidad: 0 };
      
      acc[prodId].itemsIndices.push(index);
      acc[prodId].totalCantidad += item.cantidad;
      return acc;
    }, {} as Record<number, { itemsIndices: number[], totalCantidad: number }>);

    Object.entries(agrupadosPorProducto).forEach(([prodIdStr, grupo]) => {
      const prodId = parseInt(prodIdStr);
      const producto = productos.find(p => p.id === prodId);
      
      if (!producto || !producto.packsSurtidos || producto.packsSurtidos.length === 0) {
        grupo.itemsIndices.forEach(idx => {
            nuevosItems[idx].descuentoUnitario = 0;
            nuevosItems[idx].packAplicado = undefined;
            nuevosItems[idx].packBaseName = undefined;
            nuevosItems[idx].subtotal = nuevosItems[idx].precioUnitario * nuevosItems[idx].cantidad;
        });
        return; 
      }

      const packsOrdenados = [...producto.packsSurtidos].sort((a, b) => b.cantidadRequerida - a.cantidadRequerida);
      
      let cantidadRestante = grupo.totalCantidad;
      let totalDescuentoAplicable = 0;
      let nombrePackPrincipal = "";

      for (const pack of packsOrdenados) {
        if (cantidadRestante >= pack.cantidadRequerida) {
          const cantidadDePacks = Math.floor(cantidadRestante / pack.cantidadRequerida);
          const itemsCubiertosPorPack = cantidadDePacks * pack.cantidadRequerida;
          
          const precioUnitarioBase = nuevosItems[grupo.itemsIndices[0]].precioUnitario; 
          const precioNormal = itemsCubiertosPorPack * precioUnitarioBase;
          const precioPromocion = cantidadDePacks * pack.precioPack;
          
          totalDescuentoAplicable += (precioNormal - precioPromocion);
          cantidadRestante -= itemsCubiertosPorPack;
          
          if(!nombrePackPrincipal) nombrePackPrincipal = pack.nombre; 
        }
      }

      if (totalDescuentoAplicable > 0) {
        const cantidadEnPromocion = grupo.totalCantidad - cantidadRestante;
        const descuentoPorUnidad = totalDescuentoAplicable / cantidadEnPromocion;

        let aplicados = 0;

        grupo.itemsIndices.forEach(idx => {
            let item = nuevosItems[idx];
            item.packBaseName = nombrePackPrincipal; 
            
            if(aplicados < cantidadEnPromocion) {
                if (aplicados + item.cantidad <= cantidadEnPromocion) {
                    item.descuentoUnitario = descuentoPorUnidad;
                    item.packAplicado = nombrePackPrincipal;
                    aplicados += item.cantidad;
                } else {
                   // 🚀 CORREGIDO: Eliminamos el texto corrupto y asignamos el cálculo numérico directo
                   const unidadesConDescuento = cantidadEnPromocion - aplicados;
                   const unidadesSueltas = item.cantidad - unidadesConDescuento;
                   
                   const descuentoTotalFila = unidadesConDescuento * descuentoPorUnidad;
                   item.descuentoUnitario = descuentoTotalFila / item.cantidad;
                   
                   item.packAplicado = `${nombrePackPrincipal} (+${unidadesSueltas} u)`;
                   aplicados = cantidadEnPromocion;
                }
            } else {
                item.descuentoUnitario = 0;
                item.packAplicado = undefined;
                item.packBaseName = undefined;
            }
            
            item.precioOriginal = item.precioUnitario;
            item.subtotal = (item.precioUnitario - item.descuentoUnitario) * item.cantidad;
        });
      } else {
         grupo.itemsIndices.forEach(idx => {
            nuevosItems[idx].descuentoUnitario = 0;
            nuevosItems[idx].packAplicado = undefined;
            nuevosItems[idx].packBaseName = undefined;
            nuevosItems[idx].subtotal = nuevosItems[idx].precioUnitario * nuevosItems[idx].cantidad;
        });
      }
    });

    return nuevosItems;
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const totalFinal = useMemo(() => {
    const total = subtotal - descuentoGlobal;
    return total > 0 ? total : 0;
  }, [subtotal, descuentoGlobal]);

  const totalPagado = useMemo(() => pagos.reduce((sum, pago) => sum + pago.montoPagado, 0), [pagos]);
  const vuelto = useMemo(() => totalPagado > totalFinal ? totalPagado - totalFinal : 0, [totalPagado, totalFinal]);
  const faltaPagar = useMemo(() => totalPagado < totalFinal ? totalFinal - totalPagado : 0, [totalPagado, totalFinal]);

  const hasStockErrors = useMemo(() => {
    return items.some(item => {
      const factor = item.presentacion?.factorConversion || 1;
      const cantidadFisicaTotal = item.cantidad * factor;
      return cantidadFisicaTotal > item.variante.stockActual;
    });
  }, [items]);

  const addItem = (variante: Variant, presentacion?: Presentacion) => {
    const factor = presentacion ? presentacion.factorConversion : 1;
    if (variante.stockActual < factor) {
      toast.error(`Sin stock suficiente físico para este empaque.`);
      return;
    }

    setItems((prevItems) => {
      const existe = prevItems.find((i) => i.variante.id === variante.id && i.presentacion?.id === presentacion?.id);
      
      let newItems;
      if (existe) {
        const nuevaCantidad = existe.cantidad + 1;
        if ((nuevaCantidad * factor) > variante.stockActual) {
          toast.error(`¡Límite! Solo hay ${variante.stockActual} unidades disponibles.`);
          return prevItems;
        }
        newItems = prevItems.map((i) => 
          (i.variante.id === variante.id && i.presentacion?.id === presentacion?.id)
            ? { ...i, cantidad: nuevaCantidad, subtotal: i.precioUnitario * nuevaCantidad }
            : i
        );
      } else {
        const precioAUsar = presentacion ? presentacion.precioVenta : variante.precioVenta;
        newItems = [...prevItems, { variante, presentacion, cantidad: 1, precioUnitario: precioAUsar, descuentoUnitario: 0, subtotal: precioAUsar }];
      }

      return recalcularPacksSurtidos(newItems);
    });
  };

  const updateQuantity = (varianteId: number, presentacionId: number | undefined, cantidad: number) => {
    if (cantidad <= 0) return;

    setItems((prev) => {
      const item = prev.find(i => i.variante.id === varianteId && i.presentacion?.id === presentacionId);
      if (item) {
        const factor = item.presentacion?.factorConversion || 1;
        if ((cantidad * factor) > item.variante.stockActual) {
          toast.error(`Solo quedan ${item.variante.stockActual} unidades físicas.`);
          return prev;
        }
      }

      let newItems = prev.map((i) =>
        (i.variante.id === varianteId && i.presentacion?.id === presentacionId)
          ? { ...i, cantidad, subtotal: i.precioUnitario * cantidad }
          : i
      );

      return recalcularPacksSurtidos(newItems);
    });
  };

  const changePresentation = (varianteId: number, oldPresentacionId: number | undefined, newFactor: number) => {
    setItems((prev) => {
      const index = prev.findIndex(i => i.variante.id === varianteId && i.presentacion?.id === oldPresentacionId);
      if (index === -1) return prev;

      const currentItem = prev[index];
      
      let nuevaPresentacion: Presentacion | undefined = undefined;
      if (currentItem.variante.presentaciones && newFactor > 1) {
        nuevaPresentacion = currentItem.variante.presentaciones.find(p => p.factorConversion === newFactor);
      }

      if ((currentItem.cantidad * newFactor) > currentItem.variante.stockActual) {
        toast.warning("La cantidad actual supera el stock físico disponible en este nuevo empaque. Reajustando a 1.");
        currentItem.cantidad = 1;
      }

      const precioAUsar = nuevaPresentacion ? nuevaPresentacion.precioVenta : currentItem.variante.precioVenta;

      const updatedItem: CartItem = {
        ...currentItem,
        presentacion: nuevaPresentacion,
        precioUnitario: precioAUsar,
        descuentoUnitario: 0,
        subtotal: precioAUsar * currentItem.cantidad,
        packAplicado: undefined,
        packBaseName: undefined
      };

      const newItems = [...prev];
      newItems[index] = updatedItem;

      return recalcularPacksSurtidos(newItems);
    });
  };

  const removeItem = (varianteId: number, presentacionId?: number) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => !(i.variante.id === varianteId && i.presentacion?.id === presentacionId));
      return recalcularPacksSurtidos(newItems);
    });
  };

  const addPago = (metodo: MetodoPagoVenta, monto: number, referencia?: string) => {
    setPagos((prev) => [...prev, { metodoPago: metodo, montoPagado: monto, referencia }]);
  };

  const removePago = (index: number) => {
    setPagos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
    setCliente(null);
    setPagos([]);
    setDescuentoGlobal(0);
    setObservaciones('');
    setCotizacionActiva(null);
    localStorage.removeItem(CART_STORAGE_KEY); 
  };

  const loadQuote = (validacion: any, idCotizacion: number) => {
    clearCart();

    const itemsCargados = validacion.items.map((item: any) => {
      const pres = item.presentacionId ? {
        id: item.presentacionId,
        nombre: item.nombrePresentacion,
        factorConversion: item.factorConversion,
        precioVenta: item.precioCotizado,
        codigoBarras: null 
      } : undefined;

      const prod = productos.find(p => p.id === item.productoId);

      return {
        variante: { 
          id: item.varianteId, 
          productoId: item.productoId, 
          atributos: item.atributos || {}, 
          sku: item.sku, 
          stockActual: item.stockActual,
          precioVenta: pres ? 0 : item.precioCotizado,
          productoNombre: prod ? prod.nombre : (item.productoNombre || 'Producto Desconocido'),
          marcaNombre: prod ? prod.marca : (item.marcaNombre || null),
          presentaciones: []
        },
        presentacion: pres,
        cantidad: item.cantidadSolicitada,
        precioUnitario: item.precioCotizado,
        descuentoUnitario: 0,
        subtotal: item.cantidadSolicitada * item.precioCotizado
      };
    });

    const itemsConPacksRestaurados = recalcularPacksSurtidos(itemsCargados);
    setItems(itemsConPacksRestaurados);
    setCotizacionActiva(idCotizacion);

    if (validacion.clienteId) {
      setCliente({
        id: validacion.clienteId,
        nombreCompleto: validacion.clienteNombre,
        telefono: validacion.telefonoCliente
      } as any);
    }
    
    toast.success('Modo edición activado.');
  };

  return {
    items, cliente, setCliente, pagos, descuentoGlobal, setDescuentoGlobal,
    observaciones, setObservaciones, subtotal, totalFinal, totalPagado, vuelto, faltaPagar,
    cotizacionActiva, setCotizacionActiva, 
    hasStockErrors,
    addItem, updateQuantity, removeItem, changePresentation, addPago, removePago, clearCart, loadQuote, 
  };
};