import { useState, useEffect, useRef } from 'react';
import { Printer, ArrowRight, FileText, Copy, Download, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import type { VentaResponse } from '../types/pos.types';
import { ThermalSaleReceipt } from '@/components/print/ThermalSaleReceipt'; 
import { A4QuoteDocument } from '@/components/print/A4QuoteDocument'; 

import { CompanySettingsService } from '@/features/company/services/company.api';
import { StoreService } from '@/features/stores/services/stores.api'; 
import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';

interface QuoteSuccessModalProps {
  isOpen: boolean;
  cotizacion: VentaResponse | null;
  cartClone: any[];
  onNewSale: () => void;
}

export const QuoteSuccessModal = ({ isOpen, cotizacion, cartClone, onNewSale }: QuoteSuccessModalProps) => {
  const { user } = useAuth();
  const { activeStoreId } = useStore();
  
  const [config, setConfig] = useState<any>(null);
  const [tiendaActual, setTiendaActual] = useState<any>(null);
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  // Referencias para las dos plantillas
  const thermalRef = useRef<HTMLDivElement>(null);
  const a4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const loadPrintData = async () => {
        try {
          const tiendaIdParaImprimir = activeStoreId || user?.tiendaId || 1;
          const [empresaData, tiendaData] = await Promise.all([
            CompanySettingsService.getSettings(),
            StoreService.getById(tiendaIdParaImprimir)
          ]);
          setConfig(empresaData);
          setTiendaActual(tiendaData);
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      };
      loadPrintData();
    }
  }, [isOpen, activeStoreId, user]);

  if (!isOpen || !cotizacion) return null;

  // 1. IMPRIMIR TICKET TÉRMICO (Nativo)
  const handlePrint = () => {
    window.print();
  };

  // 2. CAPTURAR IMAGEN DEL TICKET TÉRMICO (Para WhatsApp/Descarga rápida)
  const generateThermalCanvas = async () => {
    if (!thermalRef.current) return null;
    return await html2canvas(thermalRef.current, {
      scale: 2, logging: false, useCORS: true, backgroundColor: '#FFFFFF', windowWidth: 302, 
    });
  };

  // 3. CAPTURAR IMAGEN DEL A4 (Para el PDF corporativo)
  const generateA4Canvas = async () => {
    if (!a4Ref.current) return null;
    return await html2canvas(a4Ref.current, {
      scale: 2, logging: false, useCORS: true, backgroundColor: '#FFFFFF', windowWidth: 794 // Ancho A4
    });
  };

  const handleCopyImage = async () => {
    try {
      setIsCopyingImage(true);
      toast.loading('Copiando formato térmico...', { id: 'copy' });
      const canvas = await generateThermalCanvas();
      if (!canvas) throw new Error("Error en captura");
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Error blob");
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('¡Imagen copiada! Pégala en WhatsApp.', { id: 'copy' });
      }, 'image/png');
    } catch (error) {
      toast.error('Error al copiar', { id: 'copy' });
    } finally { setIsCopyingImage(false); }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      toast.loading('Descargando imagen...', { id: 'img' });
      const canvas = await generateThermalCanvas();
      if (!canvas) throw new Error("Error en captura");
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${cotizacion.correlativo}.png`;
      link.click();
      toast.success('Imagen descargada', { id: 'img' });
    } catch (error) {
      toast.error('Error al descargar', { id: 'img' });
    } finally { setIsDownloadingImage(false); }
  };

  // 4. DESCARGAR PDF (Usa la plantilla A4)
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.loading('Generando PDF Corporativo...', { id: 'pdf' });
      const canvas = await generateA4Canvas();
      if (!canvas) throw new Error("Error en captura A4");
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Proporciones A4 en mm: 210 x 297
      const pdfWidth = 210; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${cotizacion.correlativo}.pdf`);
      
      toast.success('PDF A4 descargado con éxito', { id: 'pdf' });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar PDF', { id: 'pdf' });
    } finally { setIsGeneratingPDF(false); }
  };

  return (
    <>
      {/* NOTA DE CONTROL: Mantenemos los contenedores de renderizado de documentos fijos con fondo blanco para que las imágenes y PDFs impresos salgan limpios e inmaculados */}
      {/* 1. CONTENEDOR OCULTO TÉRMICO (Para imagen WhatsApp) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={thermalRef} style={{ width: '302px' }}>
          <ThermalSaleReceipt 
            configEmpresa={config} datosTienda={tiendaActual} venta={cotizacion} detalles={cartClone}
            cajeroNombre={user?.nombre || 'Vendedor'} className="" 
          />
        </div>
      </div>

      {/* 2. CONTENEDOR OCULTO A4 (Para el PDF corporativo) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={a4Ref} style={{ width: '794px' }}> 
          <A4QuoteDocument 
            configEmpresa={config} datosTienda={tiendaActual} cotizacion={cotizacion} detalles={cartClone}
            vendedorNombre={user?.nombre || 'Vendedor'}
          />
        </div>
      </div>

      {/* 3. TICKET NATIVO PARA LA IMPRESORA TÉRMICA FÍSICA */}
      <ThermalSaleReceipt 
        configEmpresa={config} datosTienda={tiendaActual} venta={cotizacion} detalles={cartClone}
        cajeroNombre={user?.nombre || 'Vendedor'} className="print-only-ticket" 
      />

      {/* MODAL VISUAL UI */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
        {/* ✅ ADAPTACIÓN: El contenedor principal del modal se acopla a la paleta slate nocturna */}
        <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors">
          
          <div className="bg-amber-500 p-5 text-center text-white relative">
            {/* ✅ ADAPTACIÓN: El borde del círculo del icono hace juego con el fondo oscuro */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-900 transition-colors">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-wide">COTIZACIÓN GUARDADA</h2>
            <p className="text-amber-100 text-sm mt-1">{cotizacion.correlativo}</p>
          </div>

          {/* ✅ ADAPTACIÓN: Sección de montos totales con contrastes legibles de noche */}
          <div className="p-8 pt-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-1">S/ {cotizacion.totalFinal.toFixed(2)}</h3>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Cotizado</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">A nombre de: <span className="font-bold text-slate-700 dark:text-slate-200">{cotizacion.clienteNombre || 'Cliente General'}</span></p>
          </div>

          {/* ✅ ADAPTACIÓN: Fondo de zona de acciones y botones adaptados a modo noche */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/40 space-y-5 transition-colors">
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Impresión Rápida</h4>
              <button onClick={handlePrint} disabled={!config} className="w-full py-4 bg-slate-800 dark:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition-colors shadow-md disabled:opacity-50">
                <Printer className="w-5 h-5 mr-2.5" /> IMPRIMIR TICKET TÉRMICO
              </button>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Formatos Digitales</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* ✅ ADAPTACIÓN: Botones de copia e imagen con selectores de noche */}
                <button onClick={handleCopyImage} disabled={isCopyingImage || !config} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all disabled:opacity-50 group">
                  <Copy className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-500 group-hover:text-amber-500" />
                  <span className="text-xs font-bold text-center">Copiar Ticket<br/><span className="text-[9px] text-slate-400 dark:text-slate-500">(WhatsApp)</span></span>
                </button>
                
                <button onClick={handleDownloadImage} disabled={isDownloadingImage || !config} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all disabled:opacity-50 group">
                  <Download className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-500 group-hover:text-amber-500" />
                  <span className="text-xs font-bold text-center">Guardar Ticket<br/><span className="text-[9px] text-slate-400 dark:text-slate-500">(Imagen)</span></span>
                </button>
                
                {/* ✅ ADAPTACIÓN: Botón A4 corporativo estilizado para el modo noche */}
                <button onClick={handleGeneratePDF} disabled={isGeneratingPDF || !config} className="col-span-2 flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all disabled:opacity-50 group shadow-sm">
                  <FileText className="w-6 h-6 mb-1 text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                  <span className="text-sm font-bold">Descargar PDF Formato A4</span>
                  <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">Diseño Corporativo para clientes</span>
                </button>
              </div>
            </div>
          </div>

          {/* ✅ ADAPTACIÓN: Zona de cierre inferior */}
          <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <button onClick={onNewSale} className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-amber-600 transition-colors shadow-lg">
              NUEVA OPERACIÓN <ArrowRight className="w-5 h-5 ml-2.5" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};