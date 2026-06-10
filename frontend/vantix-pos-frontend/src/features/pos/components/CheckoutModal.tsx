import { useState, useEffect } from 'react';
import { X, CheckCircle2, Wallet, CreditCard, Split, ReceiptText, Tag, Lock, AlertCircle, Handshake, FileText, Plus, Trash2, Store } from 'lucide-react';
import { toast } from 'sonner';

import type { TurnoCajaResponse } from '@/features/finances/types/finances.types';
import { PosService } from '../services/pos.api';
import type { TipoComprobante, MetodoPagoVenta, VentaResponse } from '../types/pos.types';
import type { useCart } from '../hooks/useCart';

import { useStore } from '@/core/store/context/StoreContext';

const YapeIcon = () => <span className="font-black text-purple-600 dark:text-purple-400 italic tracking-tighter">yape</span>;
const PlinIcon = () => <span className="font-black text-blue-500 dark:text-blue-400 italic tracking-tighter">plin</span>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: ReturnType<typeof useCart>;
  turnoActivo: TurnoCajaResponse;
  onSuccess: (venta: VentaResponse, vuelto: number, pagoRecibido: number) => void;
}

const BILLETES_RAPIDOS = [10, 20, 50, 100, 200];

export const CheckoutModal = ({ isOpen, onClose, cart, turnoActivo, onSuccess }: CheckoutModalProps) => {
  const { activeStoreId, activeStoreName } = useStore();

  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('TICKET');
  const [pestañaPago, setPestañaPago] = useState<'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'HIBRIDO' | 'CREDITO'>('EFECTIVO');
  
  const [montoIngresadoEfectivo, setMontoIngresadoEfectivo] = useState<string>('');
  const [referenciaDigital, setReferenciaDigital] = useState('');
  const [inputDescuento, setInputDescuento] = useState<string>(cart.descuentoGlobal > 0 ? cart.descuentoGlobal.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mixtoMetodo, setMixtoMetodo] = useState<MetodoPagoVenta>('EFECTIVO');
  const [mixtoMonto, setMixtoMonto] = useState<string>('');
  const [mixtoRef, setMixtoRef] = useState('');

  const isCotizacion = tipoComprobante === 'COTIZACION';

  useEffect(() => {
    if (!cart.cliente && pestañaPago === 'CREDITO') {
      setPestañaPago('EFECTIVO');
    }
  }, [cart.cliente]);

  useEffect(() => {
    setReferenciaDigital('');
    if (pestañaPago !== 'HIBRIDO' && pestañaPago !== 'CREDITO') {
      setMontoIngresadoEfectivo(cart.faltaPagar.toFixed(2));
      if (cart.pagos.length > 0) cart.pagos.forEach((_, i) => cart.removePago(i));
    } else {
      setMontoIngresadoEfectivo('');
      setMixtoMonto(cart.faltaPagar > 0 ? cart.faltaPagar.toFixed(2) : '');
    }
  }, [pestañaPago, cart.faltaPagar]);

  if (!isOpen) return null;

  const montoNumerico = parseFloat(montoIngresadoEfectivo) || 0;
  const vueltoCalculado = montoNumerico > cart.totalFinal ? montoNumerico - cart.totalFinal : 0;
  const faltaPagarCalculado = montoNumerico < cart.totalFinal ? cart.totalFinal - montoNumerico : 0;
  const isReferenciaValida = referenciaDigital.trim().length >= 3;

  const limiteCredito = cart.cliente?.lineaCreditoMaxima || 0;
  const deudaActual = cart.cliente?.deudaActual || 0;
  const saldoDisponible = limiteCredito - deudaActual;
  const puedeFiar = cart.cliente && limiteCredito > 0 && saldoDisponible >= cart.totalFinal;

  const handleAplicarDescuento = () => {
    const desc = parseFloat(inputDescuento) || 0;
    if (desc < 0) return toast.error('El descuento no puede ser negativo');
    if (desc >= cart.subtotal) return toast.error('El descuento no puede ser mayor o igual al subtotal');
    cart.setDescuentoGlobal(desc);
    toast.success(`Descuento aplicado.`);
  };

  const handleAgregarPagoMixto = () => {
    const monto = parseFloat(mixtoMonto) || 0;
    if (monto <= 0) return toast.error('Ingrese un monto válido');
    if (monto > cart.faltaPagar && mixtoMetodo !== 'EFECTIVO') return toast.error('Solo el efectivo puede generar vuelto.');
    if (mixtoMetodo !== 'EFECTIVO' && mixtoRef.trim().length < 3) return toast.error('Referencia obligatoria para métodos digitales.');
    
    cart.addPago(mixtoMetodo, monto, mixtoRef);
    setMixtoMonto('');
    setMixtoRef('');
  };

  const handleProcesarVenta = async () => {
    if (!isCotizacion) {
      if (pestañaPago === 'EFECTIVO' && montoNumerico < cart.totalFinal) return toast.error('Falta dinero.');
      if ((pestañaPago === 'YAPE' || pestañaPago === 'PLIN' || pestañaPago === 'TARJETA') && !isReferenciaValida) return toast.error('Falta código de operación.');
      if (pestañaPago === 'HIBRIDO' && cart.faltaPagar > 0) return toast.error('Aún falta dinero para cubrir la venta.');
      if (pestañaPago === 'CREDITO' && !puedeFiar) return toast.error('El cliente no tiene saldo de crédito suficiente.');
    } else {
      if (!cart.cliente) return toast.error('Para cotizar es obligatorio seleccionar un cliente en el panel anterior.');
    }

    const pagosAEnviar = [];
    let pagoRecibidoFinal = 0;
    let vueltoFinal = 0;

    if (!isCotizacion) {
      if (pestañaPago === 'EFECTIVO') {
        pagosAEnviar.push({ metodoPago: 'EFECTIVO' as MetodoPagoVenta, montoPagado: montoNumerico });
        pagoRecibidoFinal = montoNumerico; vueltoFinal = vueltoCalculado;
      } else if (pestañaPago === 'YAPE' || pestañaPago === 'PLIN' || pestañaPago === 'TARJETA') {
        pagosAEnviar.push({ metodoPago: pestañaPago as MetodoPagoVenta, montoPagado: cart.totalFinal, referencia: referenciaDigital });
        pagoRecibidoFinal = cart.totalFinal;
      } else if (pestañaPago === 'HIBRIDO') {
        pagosAEnviar.push(...cart.pagos);
        pagoRecibidoFinal = cart.totalPagado; vueltoFinal = cart.vuelto;
      } else if (pestañaPago === 'CREDITO') {
        pagosAEnviar.push({ metodoPago: 'CREDITO' as MetodoPagoVenta, montoPagado: cart.totalFinal });
        pagoRecibidoFinal = 0; vueltoFinal = 0;
      }
    }

    try {
      setIsSubmitting(true);
      const ventaRegistrada = await PosService.procesarVenta({
        tiendaId: activeStoreId || 1, 
        usuarioId: 1, 
        turnoCajaId: turnoActivo.id,
        clienteId: cart.cliente?.id, tipoComprobante: tipoComprobante,
        subtotal: cart.subtotal, descuentoTotal: cart.descuentoGlobal, totalFinal: cart.totalFinal,
        pagoRecibido: pagoRecibidoFinal, vuelto: vueltoFinal, observaciones: cart.observaciones,
        cotizacionOrigenId: cart.cotizacionActiva, 
        
        detalles: cart.items.map(i => ({
          varianteId: i.variante.id, 
          presentacionId: i.presentacion?.id || null, 
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario, 
          descuentoUnitario: i.descuentoUnitario, 
          subtotal: i.subtotal
        })),
        pagos: pagosAEnviar
      });
      
      cart.setCotizacionActiva(null);
      onSuccess(ventaRegistrada, vueltoFinal, pagoRecibidoFinal);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[95vh] md:h-[90vh] transition-colors border border-transparent dark:border-slate-800">
        
        <div className="flex justify-between items-center p-4 sm:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <ReceiptText className="w-5 h-5 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-primary dark:text-blue-400" /> Completar Venta
            </h2>
            
            <div className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg w-max transition-colors">
              <Store className="w-3 h-3 sm:w-4 sm:h-4 text-primary dark:text-blue-400 mr-1.5 sm:mr-2" />
              <span className="text-[10px] sm:text-sm font-bold text-primary dark:text-blue-400 uppercase tracking-wider">
                {activeStoreName || 'Tienda Principal'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors self-start sm:self-auto">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          
          {/* PANEL IZQUIERDO (Comprobante y Totales) */}
          <div className="w-full lg:w-[35%] bg-white dark:bg-slate-900 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 lg:overflow-y-auto transition-colors">
            <div className="mb-5 sm:mb-6">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 sm:mb-3">1. Comprobante</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTipoComprobante('TICKET')} className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all ${tipoComprobante === 'TICKET' ? 'border-primary bg-blue-50 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                  <p className={`font-bold text-sm sm:text-base ${tipoComprobante === 'TICKET' ? 'text-primary dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>TICKET</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">Uso interno.</p>
                </button>
                <button onClick={() => setTipoComprobante('COTIZACION')} className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all ${tipoComprobante === 'COTIZACION' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                  <p className={`font-bold text-sm sm:text-base ${tipoComprobante === 'COTIZACION' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>COTIZACIÓN</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">Proforma.</p>
                </button>
                <button disabled className="p-2.5 sm:p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-left relative opacity-70 cursor-not-allowed">
                  <div className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-bl-lg font-bold flex items-center"><Lock className="w-2 h-2 mr-1"/> FUTURO</div>
                  <p className="font-bold text-sm sm:text-base text-slate-400 dark:text-slate-600">BOLETA</p>
                </button>
                <button disabled className="p-2.5 sm:p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-left relative opacity-70 cursor-not-allowed">
                  <div className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-bl-lg font-bold flex items-center"><Lock className="w-2 h-2 mr-1"/> FUTURO</div>
                  <p className="font-bold text-sm sm:text-base text-slate-400 dark:text-slate-600">FACTURA</p>
                </button>
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <label className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 sm:mb-3"><Tag className="w-4 h-4 mr-1.5"/> 2. Descuentos</label>
              <div className="mb-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Manual (S/)</p>
                <div className="flex space-x-2">
                  <input type="number" step="0.10" value={inputDescuento} onChange={(e) => setInputDescuento(e.target.value)} className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:border-primary dark:focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors"/>
                  <button onClick={handleAplicarDescuento} className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">Aplicar</button>
                </div>
              </div>
            </div>

            <div className="mt-auto bg-slate-800 dark:bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-inner shrink-0 transition-colors">
              <div className="flex justify-between items-center mb-1 text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                <span>Subtotal:</span><span>S/ {cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.descuentoGlobal > 0 && (
                <div className="flex justify-between items-center mb-2 text-red-400 text-xs sm:text-sm font-bold border-b border-slate-700 dark:border-slate-800 pb-2">
                  <span>Descuento Manual:</span><span>- S/ {cart.descuentoGlobal.toFixed(2)}</span>
                </div>
              )}
              <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mb-1 mt-2">TOTAL A COBRAR</p>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-4">S/ {cart.totalFinal.toFixed(2)}</div>
              <div className="flex justify-between items-center text-xs sm:text-sm border-t border-slate-700 dark:border-slate-800 pt-3 text-slate-300 dark:text-slate-400">
                <span>Cliente:</span>
                <span className="font-bold text-white dark:text-slate-200 truncate max-w-[150px]">{cart.cliente?.nombreCompleto || 'Público General'}</span>
              </div>
            </div>
          </div>

          {/* PANEL DERECHO (Pagos y Confirmación) */}
          <div className="w-full lg:w-[65%] flex flex-col p-4 sm:p-6 shrink-0 lg:overflow-y-auto relative bg-slate-50 dark:bg-slate-950 lg:bg-transparent transition-colors">
            
            {isCotizacion ? (
              <div className="flex flex-col h-full items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center mb-4 sm:mb-6 border-4 border-white dark:border-slate-900 shadow-sm transition-colors">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 sm:mb-4">Modo Proforma</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg max-w-md">
                  Las cotizaciones no requiren método de pago ni descuentan stock del almacén. 
                  Se guardarán con una validez de 7 días.
                </p>

                {!cart.cliente && (
                  <div className="mt-6 sm:mt-8 flex items-start bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900/30 transition-colors">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-bold text-left">Obligatorio: Cierra esta ventana y selecciona un cliente en el panel para poder generar la cotización.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">3. Método de Pago</label>
                
                <div className="flex space-x-2 mb-4 sm:mb-6 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-xl overflow-x-auto custom-scrollbar transition-colors">
                  <button onClick={() => setPestañaPago('EFECTIVO')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'EFECTIVO' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Wallet className="w-4 h-4 sm:w-5 sm:h-5 mb-1" /> EFECTIVO</button>
                  <button onClick={() => setPestañaPago('YAPE')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'YAPE' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><div className="mb-1"><YapeIcon /></div> YAPE</button>
                  <button onClick={() => setPestañaPago('PLIN')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'PLIN' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><div className="mb-1"><PlinIcon /></div> PLIN</button>
                  <button onClick={() => setPestañaPago('TARJETA')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'TARJETA' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mb-1" /> TARJETA</button>
                  <button onClick={() => setPestañaPago('HIBRIDO')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'HIBRIDO' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}><Split className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-amber-500 dark:text-amber-400" /> MIXTO</button>
                  
                  {cart.cliente && (
                    <button onClick={() => setPestañaPago('CREDITO')} className={`flex-1 min-w-[80px] sm:min-w-[90px] flex flex-col items-center justify-center py-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all ${pestañaPago === 'CREDITO' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      <Handshake className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 ${pestañaPago === 'CREDITO' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} /> CRÉDITO
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto mb-20 lg:mb-0">
                  {pestañaPago === 'EFECTIVO' && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto Recibido (S/)</label>
                        <input type="number" step="0.10" autoFocus value={montoIngresadoEfectivo} onChange={(e) => setMontoIngresadoEfectivo(e.target.value)} className="w-full p-3 sm:p-4 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:focus:border-blue-500 font-black text-2xl sm:text-3xl text-center bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-inner transition-colors"/>
                      </div>
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                          <button onClick={() => setMontoIngresadoEfectivo(cart.totalFinal.toString())} className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-sm text-sm sm:text-base transition-colors">Exacto: {cart.totalFinal.toFixed(2)}</button>
                          {BILLETES_RAPIDOS.filter(b => b > cart.totalFinal).map(b => (
                            <button key={b} onClick={() => setMontoIngresadoEfectivo(b.toString())} className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-primary dark:hover:text-blue-400 shadow-sm text-sm sm:text-lg transition-colors">S/ {b}</button>
                          ))}
                        </div>
                      </div>
                      <div className={`p-4 sm:p-6 rounded-2xl text-center border-2 transition-colors ${faltaPagarCalculado > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        <p className="font-bold text-xs sm:text-sm mb-1">{faltaPagarCalculado > 0 ? 'FALTA COBRAR' : 'VUELTO / CAMBIO'}</p>
                        <p className="text-4xl sm:text-6xl font-black">S/ {faltaPagarCalculado > 0 ? faltaPagarCalculado.toFixed(2) : vueltoCalculado.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {(pestañaPago === 'YAPE' || pestañaPago === 'PLIN' || pestañaPago === 'TARJETA') && (
                    <div className="space-y-4 flex flex-col items-center justify-center h-full animate-in fade-in py-8 sm:py-0">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">Cobro exacto: S/ {cart.totalFinal.toFixed(2)}</h3>
                      <div className="w-full max-w-md bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sm:shadow-none transition-colors">
                        <label className="flex items-center text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">N° Operación <span className="text-red-500 ml-1">*</span></label>
                        <input type="text" autoFocus value={referenciaDigital} onChange={(e) => setReferenciaDigital(e.target.value)} placeholder="Mínimo 3 dígitos" className={`w-full p-3 sm:p-4 border-2 rounded-xl outline-none font-medium bg-white dark:bg-slate-900 text-sm sm:text-base text-slate-800 dark:text-white transition-colors ${referenciaDigital.length > 0 && !isReferenciaValida ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'}`}/>
                      </div>
                    </div>
                  )}

                  {pestañaPago === 'HIBRIDO' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in">
                      
                      <div className="bg-white dark:bg-slate-900 sm:bg-slate-50 sm:dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-start shadow-sm sm:shadow-none transition-colors">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 sm:mb-4 flex items-center">
                          <Plus className="w-4 h-4 mr-1 text-primary dark:text-blue-400" /> Agregar Pago a la Lista
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex gap-2 sm:gap-3">
                            <div className="flex-1">
                              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 sm:mb-1.5">Método</label>
                              <select 
                                value={mixtoMetodo} 
                                onChange={(e) => setMixtoMetodo(e.target.value as MetodoPagoVenta)}
                                className="w-full p-2.5 sm:p-3 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:focus:border-blue-500 font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors"
                              >
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="YAPE">Yape</option>
                                <option value="PLIN">Plin</option>
                                <option value="TARJETA">Tarjeta</option>
                                <option value="TRANSFERENCIA">Transf.</option>
                              </select>
                            </div>

                            <div className="flex-1">
                              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 sm:mb-1.5">Monto (S/)</label>
                              <input 
                                type="number" step="0.10" 
                                value={mixtoMonto} 
                                onChange={(e) => setMixtoMonto(e.target.value)} 
                                placeholder="0.00"
                                className="w-full p-2.5 sm:p-3 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:focus:border-blue-500 font-black text-sm sm:text-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                          </div>

                          {mixtoMetodo !== 'EFECTIVO' && parseFloat(mixtoMonto) > cart.faltaPagar && (
                            <p className="text-[9px] sm:text-[10px] text-red-500 dark:text-red-400 font-bold mt-1 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/30 transition-colors">
                              * Solo el efectivo puede recibir montos mayores para dar vuelto.
                            </p>
                          )}

                          {mixtoMetodo !== 'EFECTIVO' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 sm:mb-1.5">N° Operación / Ref.</label>
                              <input 
                                type="text" 
                                value={mixtoRef} 
                                onChange={(e) => setMixtoRef(e.target.value)} 
                                placeholder="Mínimo 3 dígitos"
                                className="w-full p-2.5 sm:p-3 border-2 border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:focus:border-blue-500 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors"
                              />
                            </div>
                          )}

                          <button 
                            onClick={handleAgregarPagoMixto}
                            disabled={cart.faltaPagar <= 0}
                            className="w-full py-3 sm:py-3.5 bg-slate-800 dark:bg-slate-700 text-white text-sm sm:text-base font-black rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm mt-2"
                          >
                            AGREGAR PAGO
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className={`p-4 sm:p-5 rounded-2xl border-2 mb-3 sm:mb-4 text-center transition-colors ${cart.faltaPagar > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                            {cart.faltaPagar > 0 ? 'FALTA COBRAR' : 'VUELTO A ENTREGAR'}
                          </p>
                          <p className="text-3xl sm:text-4xl font-black">
                            S/ {cart.faltaPagar > 0 ? cart.faltaPagar.toFixed(2) : cart.vuelto.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col shadow-sm transition-colors">
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center border-b border-slate-200 dark:border-slate-700 transition-colors">
                            Pagos Registrados ({cart.pagos.length})
                          </div>
                          <div className="flex-1 overflow-y-auto p-2 sm:p-3 min-h-[120px]">
                            {cart.pagos.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 opacity-60">
                                <ReceiptText className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                                <p className="text-xs sm:text-sm font-medium">Aún no hay pagos.</p>
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {cart.pagos.map((p, idx) => (
                                  <li key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 p-2 sm:p-3 rounded-xl animate-in fade-in slide-in-from-right-2 transition-colors">
                                    <div>
                                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm flex items-center">
                                        {p.metodoPago === 'YAPE' && <span className="mr-1"><YapeIcon/></span>}
                                        {p.metodoPago === 'PLIN' && <span className="mr-1"><PlinIcon/></span>}
                                        {p.metodoPago !== 'YAPE' && p.metodoPago !== 'PLIN' && p.metodoPago}
                                      </div>
                                      {p.referencia && <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Ref: {p.referencia}</p>}
                                    </div>
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                      <span className="font-black text-primary dark:text-blue-400 text-sm sm:text-base">S/ {p.montoPagado.toFixed(2)}</span>
                                      <button onClick={() => cart.removePago(idx)} className="p-1 sm:p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Eliminar pago">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {pestañaPago === 'CREDITO' && cart.cliente && (
                    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200 items-center justify-center py-6 sm:py-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-4 border-white dark:border-slate-900 shadow-sm transition-colors">
                        <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Venta al Crédito</h3>

                      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 transition-colors">
                        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Línea Máxima:</span>
                          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-200">S/ {limiteCredito.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Deuda Actual:</span>
                          <span className="text-sm sm:text-base font-black text-red-500 dark:text-red-400">- S/ {deudaActual.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 sm:pt-2">
                          <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">Saldo a Favor:</span>
                          <span className={`text-xl sm:text-2xl font-black ${saldoDisponible >= cart.totalFinal ? 'text-emerald-500' : 'text-red-500 dark:text-red-400'}`}>
                            S/ {saldoDisponible.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {!puedeFiar ? (
                        <div className="mt-4 sm:mt-6 flex items-start bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 p-3 sm:p-4 rounded-xl max-w-md border border-red-200 dark:border-red-900/30 transition-colors">
                          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
                          <p className="text-xs sm:text-sm font-bold">El cliente no tiene saldo suficiente para cubrir los S/ {cart.totalFinal.toFixed(2)}. Por favor, cobre en Efectivo o Yape.</p>
                        </div>
                      ) : (
                        <div className="mt-4 sm:mt-6 flex items-start bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-3 sm:p-4 rounded-xl max-w-md border border-amber-200 dark:border-amber-900/30 transition-colors">
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0 text-amber-500 dark:text-amber-400" />
                          <p className="text-xs sm:text-sm font-bold">Saldo disponible. La venta se registrará a nombre de {cart.cliente.nombreCompleto} y su deuda sumará automáticamente.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* BOTÓN STICKY FIJO AL FONDO */}
            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-950 lg:bg-transparent pt-3 sm:pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 lg:border-t-0 z-10 pb-4 lg:pb-0 transition-colors">
              <button 
                type="button"
                onClick={handleProcesarVenta}
                disabled={
                  isSubmitting || 
                  (isCotizacion && !cart.cliente) || 
                  (!isCotizacion && pestañaPago === 'EFECTIVO' && faltaPagarCalculado > 0) || 
                  (!isCotizacion && (pestañaPago === 'YAPE' || pestañaPago === 'PLIN' || pestañaPago === 'TARJETA') && !isReferenciaValida) ||
                  (!isCotizacion && pestañaPago === 'HIBRIDO' && cart.faltaPagar > 0) ||
                  (!isCotizacion && pestañaPago === 'CREDITO' && !puedeFiar)
                }
                className={`w-full py-4 sm:py-5 text-white text-lg sm:text-xl font-black rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-lg ${isCotizacion ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isSubmitting ? 'PROCESANDO...' : (
                  <>
                    {isCotizacion ? <FileText className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3" /> : <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3" />}
                    {isCotizacion ? 'GUARDAR COTIZACIÓN' : 'CONFIRMAR VENTA E IMPRIMIR'}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};