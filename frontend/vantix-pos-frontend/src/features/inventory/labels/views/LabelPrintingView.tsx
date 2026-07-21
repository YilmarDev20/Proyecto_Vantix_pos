import { useEffect, useState, useRef } from 'react';
import { Printer, Zap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

import type { Variant } from '../../variant/types/variant.types';
import { api } from '@/config/api'; 
import { VariantService } from '../../variant/services/variant.api';
import { useStore } from '@/core/store/context/StoreContext';

import { PrintQueueTable } from '../components/PrintQueueTable';
import { PrintLabelEngine } from '../components/PrintLabelEngine';
import { LabelPackageModal } from '../components/LabelPackageModal';
import { AdvancedProductSearch } from '@/components/ui/AdvancedProductSearch';

interface PrintItem extends Variant {
  cantidadImprimir: number;
}

export const LabelPrintingView = () => {
  const { activeStoreId } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [formato, setFormato] = useState<'TERMICA_50X25' | 'TERMICA_30X20'>('TERMICA_50X25');
  const [razonSocial, setRazonSocial] = useState('Cargando...');
  const [todasLasVariantes, setTodasLasVariantes] = useState<Variant[]>([]);
  const [colaImpresion, setColaImpresion] = useState<PrintItem[]>(() => {
    const guardado = localStorage.getItem('vantix_label_queue');
    return guardado ? JSON.parse(guardado) : [];
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState<Variant | null>(null);
  const [mostrarModalEmpaques, setMostrarModalEmpaques] = useState(false);

  useEffect(() => {
    localStorage.setItem('vantix_label_queue', JSON.stringify(colaImpresion));
  }, [colaImpresion]);

  // Carga de la configuración del ticket/empresa
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const { data } = await api.get('/configuracion');
        setRazonSocial(data.razonSocial || data[0]?.razonSocial || 'Mi Empresa');
      } catch (error) {
        setRazonSocial('Tienda Local'); 
      }
    };
    fetchConfiguracion();
  }, []);

  // 🚀 Cargamos el catálogo completo de variantes requerido por el nuevo buscador compartido
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const data = await VariantService.getAll(activeStoreId || 1);
        setTodasLasVariantes(data);
      } catch (error) {
        console.error("Error cargando inventario para etiquetas:", error);
      }
    };
    cargarInventario();
  }, [activeStoreId]);

  // Formateador de texto personalizado para las etiquetas de barra
  const formatearNombreCompleto = (item: Variant) => {
    const nombre = item.productoNombre || '';
    const marca = item.marcaNombre ? `[${item.marcaNombre}]` : '';
    
    let textoAtributos = '';
    if (item.atributos && typeof item.atributos === 'object') {
      textoAtributos = Object.values(item.atributos)
        .filter(val => typeof val === 'string' || typeof val === 'number')
        .join(' ');
    }

    return `${nombre} ${marca} ${textoAtributos ? `- ${textoAtributos}` : ''}`
      .trim()
      .replace(/\s+/g, ' ');
  };

  const controlarSeleccionProducto = (v: Variant) => {
    const listaPresentaciones = (v as any).presentaciones || [];
    
    if (listaPresentaciones.length > 0) {
      setProductoSeleccionado(v);
      setMostrarModalEmpaques(true);
    } else {
      ejecutarAgregarACola(v);
    }
  };

  const ejecutarAgregarACola = (v: Variant, empaqueSeleccionado?: any) => {
    let productoFinal = { ...v };

    if (empaqueSeleccionado) {
      productoFinal = {
        ...v,
        id: Number(`${v.id}${empaqueSeleccionado.id || Math.floor(Math.random() * 1000)}`),
        codigoBarras: empaqueSeleccionado.codigoBarras || v.codigoBarras,
        precioVenta: empaqueSeleccionado.precioVenta || v.precioVenta,
        productoNombre: `${v.productoNombre} (${empaqueSeleccionado.nombre || 'Por Mayor'})`
      };
    }

    if (colaImpresion.find(item => item.id === productoFinal.id)) {
      toast.info('Este formato de producto ya está en la lista');
      return;
    }

    setColaImpresion([...colaImpresion, { ...productoFinal, cantidadImprimir: 1 }]);
    setMostrarModalEmpaques(false);
    setProductoSeleccionado(null);
  };

  const actualizarCantidad = (id: number, cant: number) => {
    setColaImpresion(colaImpresion.map(item => item.id === id ? { ...item, cantidadImprimir: Math.max(1, cant) } : item));
  };

  const igualarAlStockGlobal = () => {
    setColaImpresion(colaImpresion.map(item => ({ ...item, cantidadImprimir: item.stockActual > 0 ? item.stockActual : 1 })));
    toast.success('Cantidades sincronizadas al stock');
  };

  const limpiarTodaLaLista = () => {
    if (colaImpresion.length === 0) return;
    setColaImpresion([]);
    toast.success('Lista de impresión vaciada');
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef, 
    documentTitle: 'Etiquetas_Vantix',
    onPrintError: () => toast.error('Error al generar la impresión.'),
  });

  return (
    <div className="space-y-6">
      
      {/* 🚀 Cambiamos el buscador viejo por nuestro componente UI inteligente del core */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative z-30">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
          Buscar Producto para Impresión
        </label>
        <AdvancedProductSearch 
          items={todasLasVariantes}
          onSelectItem={controlarSeleccionProducto}
          customFormatName={formatearNombreCompleto}
          placeholder="Escribe palabras sueltas, marcas o atributos sin preocuparte por los guiones..."
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={igualarAlStockGlobal} className="flex items-center px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 shadow-sm transition-colors">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> IGUALAR STOCK
            </button>
            <button 
              onClick={limpiarTodaLaLista}
              disabled={colaImpresion.length === 0}
              className="flex items-center px-3 py-1.5 bg-rose-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 text-xs font-bold rounded-lg hover:bg-rose-600 shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> LIMPIAR LISTA
            </button>
          </div>
          
          <select 
            value={formato} 
            onChange={(e) => setFormato(e.target.value as any)} 
            className="text-xs font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full md:w-auto"
          >
            <option value="TERMICA_50X25">ROLLO TÉRMICO (50mm x 25mm)</option>
            <option value="TERMICA_30X20">ROLLO TÉRMICO (30mm x 20mm)</option>
          </select>
        </div>

        <PrintQueueTable 
          cola={colaImpresion} 
          onActualizarCantidad={actualizarCantidad}
          onIgualarStock={(id, stock) => actualizarCantidad(id, stock)}
          onEliminar={(id) => setColaImpresion(colaImpresion.filter(i => i.id !== id))}
        />
        
        {colaImpresion.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => handlePrint()} className="w-full py-4 bg-slate-800 dark:bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center hover:bg-slate-900 dark:hover:bg-blue-700 transition-all">
              <Printer className="w-5 h-5 mr-3" /> CONFIRMAR E IMPRIMIR LOTE
            </button>
          </div>
        )}
      </div>

      <div className="hidden">
        <PrintLabelEngine 
          ref={printRef} 
          cola={colaImpresion} 
          formato={formato} 
          razonSocial={razonSocial} 
        />
      </div>

      <LabelPackageModal 
        isOpen={mostrarModalEmpaques}
        onClose={() => { setMostrarModalEmpaques(false); setProductoSeleccionado(null); }}
        producto={productoSeleccionado}
        onSelect={ejecutarAgregarACola}
      />
    </div>
  );
};