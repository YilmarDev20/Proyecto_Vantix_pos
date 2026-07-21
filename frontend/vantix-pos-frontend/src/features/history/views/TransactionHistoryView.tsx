import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { HistoryService } from '../services/history.api';
import { QuotesService, type ValidacionCotizacion } from '../services/quotes.api';
import type { Transaction } from '../types/history.types';

import { useCart } from '@/features/pos/hooks/useCart';

import { HistoryKpis } from '../components/HistoryKpis';
import { HistoryFilters } from '../components/HistoryFilters';
import { HistoryTable } from '../components/HistoryTable';
import { StockValidationModal } from '../components/StockValidationModal';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { useStore } from '@/core/store/context/StoreContext';

interface TransactionHistoryViewProps {
  forcedTab?: 'VENTAS' | 'COTIZACIONES';
}

export const TransactionHistoryView = ({ forcedTab = 'VENTAS' }: TransactionHistoryViewProps) => {
  const navigate = useNavigate();
  const cart = useCart([]);
  const { activeStoreId } = useStore();
  
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'VENTAS' | 'COTIZACIONES'>(forcedTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState('TODOS');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [detalleVenta, setDetalleVenta] = useState<Transaction | null>(null);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [dataValidacion, setDataValidacion] = useState<ValidacionCotizacion | null>(null);
  const [cotizacionAValidarId, setCotizacionAValidarId] = useState<number | null>(null);

  useEffect(() => {
    setActiveTab(forcedTab);
    setEstadoFiltro('TODOS');
  }, [forcedTab]);

  const cargarHistorial = async () => {
    try {
      setIsLoading(true);
      const data = await HistoryService.obtenerHistorial(activeStoreId);
      setTransacciones(data);
    } catch (error) {
      toast.error('Error al cargar el historial de transacciones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [activeStoreId]);

  const handleIntentarCobrar = async (id: number) => {
    try {
      toast.loading('Verificando disponibilidad de productos...', { id: 'val-stock' });
      const validacion = await QuotesService.validarParaCobro(id, activeStoreId || 1); 
      toast.dismiss('val-stock');

      setDataValidacion(validacion);
      setCotizacionAValidarId(id); 

      if (validacion.todoDisponible) {
        cart.loadQuote(validacion, id);
        navigate('/pos');
      } else {
        setIsStockModalOpen(true);
      }
    } catch (error: any) {
      toast.dismiss('val-stock');
      toast.error(error.response?.data?.message || 'No se pudo validar la cotización.');
    }
  };

  // 🚀 CORREGIDO: Se quitó el espacio en blanco que rompía la compilación
  const handleConfirmarCargaConFaltantes = () => {
    if (dataValidacion && cotizacionAValidarId) {
      cart.loadQuote(dataValidacion, cotizacionAValidarId);
      setIsStockModalOpen(false);
      navigate('/pos');
    }
  };

  const handleAnularVenta = async () => {
    if (!selectedId) return;
    try {
      await HistoryService.anularVenta(selectedId);
      
      const txAnulada = transacciones.find(t => t.id === selectedId);
      if (txAnulada?.tipoComprobante === 'COTIZACION') {
        toast.success('Cotización anulada correctamente.');
      } else {
        toast.success('Venta anulada. Stock y Caja actualizados.');
      }
      
      cargarHistorial();
      setIsAnularModalOpen(false); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al anular.');
    }
  };

  const openDetalleModal = async (id: number) => {
    setIsDetalleModalOpen(true);
    setIsLoadingDetalle(true);
    try {
      const data = await HistoryService.obtenerDetalle(id);
      setDetalleVenta(data);
    } catch (error) {
      toast.error('Error al obtener detalle.');
      setIsDetalleModalOpen(false);
    } finally {
      setIsLoadingDetalle(false);
    }
  };

  const kpis = useMemo(() => {
    const ventasCompletas = transacciones.filter(t => t.tipoComprobante !== 'COTIZACION' && t.estadoVenta === 'COMPLETADA');
    const cotizacionesPendientes = transacciones.filter(t => t.tipoComprobante === 'COTIZACION' && t.estadoVenta === 'PENDIENTE_COTIZACION');
    const totalIngresos = ventasCompletas.reduce((sum, v) => sum + v.totalFinal, 0);
    
    return { 
      cantidadVentas: ventasCompletas.length, 
      totalIngresos, 
      cantidadCotizaciones: cotizacionesPendientes.length 
    };
  }, [transacciones]);

  const dataFiltrada = transacciones.filter(t => {
    const esCotizacion = t.tipoComprobante === 'COTIZACION';
    if (activeTab === 'VENTAS' && esCotizacion) return false;
    if (activeTab === 'COTIZACIONES' && !esCotizacion) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchBusqueda = (t.clienteNombre?.toLowerCase().includes(searchLower) || false) || t.correlativo.toLowerCase().includes(searchLower);
    if (!matchBusqueda) return false;

    const fechaTx = new Date(t.fechaVenta).toISOString().split('T')[0];
    if (fechaDesde && fechaTx < fechaDesde) return false;
    if (fechaHasta && fechaTx > fechaHasta) return false;

    if (activeTab === 'VENTAS' && tipoFiltro !== 'TODOS' && t.tipoComprobante !== tipoFiltro) return false;

    if (activeTab === 'VENTAS' && metodoPagoFiltro !== 'TODOS') {
      if (!t.pagos || t.pagos.length === 0) return false;
      if (metodoPagoFiltro === 'MIXTO') {
        if (t.pagos.length <= 1) return false;
      } else {
        if (!t.pagos.some(p => p.metodoPago === metodoPagoFiltro)) return false;
      }
    }

    if (estadoFiltro !== 'TODOS') {
      if (activeTab === 'COTIZACIONES') {
        if (estadoFiltro === 'PENDIENTE' && t.estadoVenta !== 'PENDIENTE_COTIZACION') return false;
        if (estadoFiltro === 'COBRADA' && t.estadoVenta !== 'COMPLETADA') return false;
        if (estadoFiltro === 'ANULADA' && t.estadoVenta !== 'ANULADA') return false;
      } else {
        if (estadoFiltro === 'COMPLETADA' && t.estadoVenta !== 'COMPLETADA') return false;
        if (estadoFiltro === 'ANULADA' && t.estadoVenta !== 'ANULADA') return false;
      }
    }

    return true;
  });

  const transaccionAAnular = transacciones.find(t => t.id === selectedId);
  const esAnulacionDeCotizacion = transaccionAAnular?.tipoComprobante === 'COTIZACION';

  return (
    <div className="p-4 h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
            Historial de {activeTab === 'VENTAS' ? 'Ventas Reales' : 'Cotizaciones'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            {activeTab === 'VENTAS' 
              ? 'Consulta el registro de tus transacciones completadas, anulaciones e ingresos de caja.' 
              : 'Gestión y verificación de proformas emitidas para clientes con carga rápida a caja.'}
          </p>
        </div>
      </div>

      <HistoryKpis {...kpis} />
      
      <HistoryFilters 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        fechaDesde={fechaDesde} setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta} setFechaHasta={setFechaHasta}
        tipoFiltro={tipoFiltro} setTipoFiltro={setTipoFiltro}
        metodoPagoFiltro={metodoPagoFiltro} setMetodoPagoFiltro={setMetodoPagoFiltro}
        estadoFiltro={estadoFiltro} setEstadoFiltro={setEstadoFiltro}
        activeTab={activeTab}
      />
      
      <div className="flex-1 overflow-y-auto mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <HistoryTable 
          isLoading={isLoading} 
          data={dataFiltrada} 
          activeTab={activeTab} 
          onOpenDetalle={openDetalleModal} 
          onOpenAnular={(id) => { setSelectedId(id); setIsAnularModalOpen(true); }}
          onCobrarCotizacion={handleIntentarCobrar}
        />
      </div>

      <StockValidationModal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        validacion={dataValidacion} 
        onConfirm={handleConfirmarCargaConFaltantes} 
      />

      <ConfirmDialog 
        isOpen={isAnularModalOpen} 
        onClose={() => setIsAnularModalOpen(false)} 
        onConfirm={handleAnularVenta} 
        title={esAnulacionDeCotizacion ? "Anular Cotización" : "Anular Transacción"} 
        message={
          esAnulacionDeCotizacion 
            ? "¿Estás seguro de anular esta cotización? Dejará de estar pendiente. Esta acción no afecta inventario ni caja." 
            : "¿Estás completamente seguro? El dinero saldrá de caja y el stock volverá al inventario."
        } 
        isDestructive={true} 
      />

      <TransactionDetailModal 
        isOpen={isDetalleModalOpen} 
        onClose={() => setIsDetalleModalOpen(false)} 
        detalleVenta={detalleVenta} 
        isLoading={isLoadingDetalle} 
      />
    </div>
  );
};