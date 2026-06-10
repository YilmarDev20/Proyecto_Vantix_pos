import { useEffect, useState } from 'react';
import { Search, Printer, Zap} from 'lucide-react';
import { toast } from 'sonner';

import { VariantService } from '../../variant/services/variant.api';
import { useStore } from '@/core/store/context/StoreContext';
import type { Variant } from '../../variant/types/variant.types';
import { api } from '@/config/api'; 

// Importamos los fragmentos que creamos
import { PrintQueueTable } from '../components/PrintQueueTable';
import { PrintLabelEngine } from '../components/PrintLabelEngine';

interface PrintItem extends Variant {
  cantidadImprimir: number;
}

export const LabelPrintingView = () => {
  const { activeStoreId } = useStore(); 
  
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Variant[]>([]);
  const [formato, setFormato] = useState<'TERMICA' | 'A4_NORMAL' | 'A4_MINI'>('A4_NORMAL');
  const [razonSocial, setRazonSocial] = useState('Cargando...');
  const [colaImpresion, setColaImpresion] = useState<PrintItem[]>(() => {
    const guardado = localStorage.getItem('vantix_label_queue');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('vantix_label_queue', JSON.stringify(colaImpresion));
  }, [colaImpresion]);

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

  useEffect(() => {
    if (busqueda.length < 2) { setResultados([]); return; }
    const timeoutId = setTimeout(async () => {
      try {
        const data = await VariantService.getAll(activeStoreId || 1);
        const filtrados = data.filter(v => 
          v.productoNombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
          v.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
          v.codigoBarras?.toLowerCase().includes(busqueda.toLowerCase())
        );
        setResultados(filtrados.slice(0, 5));
      } catch (error) { console.error("Error buscando"); }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [busqueda, activeStoreId]);

  const agregarACola = (v: Variant) => {
    if (colaImpresion.find(item => item.id === v.id)) {
      toast.info('El producto ya está en la lista');
      return;
    }
    setColaImpresion([...colaImpresion, { ...v, cantidadImprimir: 1 }]);
    setBusqueda('');
    setResultados([]);
  };

  const actualizarCantidad = (id: number, cant: number) => {
    setColaImpresion(colaImpresion.map(item => item.id === id ? { ...item, cantidadImprimir: Math.max(1, cant) } : item));
  };

  const igualarAlStockGlobal = () => {
    setColaImpresion(colaImpresion.map(item => ({ ...item, cantidadImprimir: item.stockActual > 0 ? item.stockActual : 1 })));
    toast.success('Cantidades sincronizadas al stock');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative z-20 transition-colors">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">Buscar Producto</label>
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input 
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe nombre, SKU o código..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-primary outline-none font-medium transition-all text-slate-800 dark:text-slate-100"
          />
          {/* Resultados simplificados */}
          {resultados.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50">
              {resultados.map(v => (
                <button key={v.id} onClick={() => agregarACola(v)} className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{v.productoNombre}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{v.sku}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px] transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
          <div className="flex gap-2">
            <button onClick={igualarAlStockGlobal} className="flex items-center px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 shadow-sm">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> IGUALAR STOCK
            </button>
          </div>
          <select 
            value={formato} 
            onChange={(e) => setFormato(e.target.value as any)} 
            className="text-xs font-bold border-2 border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full md:w-auto transition-colors"
          >
            <option value="TERMICA">TICKETERA TÉRMICA (ROLLO)</option>
            <option value="A4_NORMAL">HOJA A4 - ESTÁNDAR (3 Columnas)</option>
            <option value="A4_MINI">HOJA A4 - MINI (4 Columnas)</option>
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
            <button onClick={() => window.print()} className="w-full py-4 bg-slate-800 dark:bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center hover:bg-slate-900 dark:hover:bg-blue-700 transition-all">
              <Printer className="w-5 h-5 mr-3" /> CONFIRMAR E IMPRIMIR LOTE
            </button>
          </div>
        )}
      </div>

      {/* MOTOR DE IMPRESIÓN OCULTO */}
      <PrintLabelEngine cola={colaImpresion} formato={formato} razonSocial={razonSocial} />
    </div>
  );
};