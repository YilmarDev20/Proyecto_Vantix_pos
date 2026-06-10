import { useEffect, useState, useRef } from 'react';
import { CheckCircle, Printer, ArrowRight, FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Importando el tipo que faltaba
import type { VentaResponse } from '../types/pos.types';

import { ThermalSaleReceipt } from '@/components/print/ThermalSaleReceipt'; 
import { CompanySettingsService } from '@/features/company/services/company.api';
import { StoreService } from '@/features/stores/services/stores.api'; 
import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';

interface TicketSuccessModalProps {
  isOpen: boolean;
  venta: VentaResponse | null;
  vuelto: number;
  pagoRecibido: number;
  cartClone: any[];
  onNewSale: () => void;
}

export const TicketSuccessModal = ({ isOpen, venta, vuelto, pagoRecibido, cartClone, onNewSale }: TicketSuccessModalProps) => {
  const { user } = useAuth();
  const { activeStoreId } = useStore();
  
  const [config, setConfig] = useState<any>(null);
  const [tiendaActual, setTiendaActual] = useState<any>(null);
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

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
          console.error("Error cargando datos de impresión:", error);
        }
      };
      loadPrintData();
    }
  }, [isOpen, activeStoreId, user]);

  if (!isOpen || !venta) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateTicketCanvas = async () => {
    if (!printRef.current) return null;
    
    return await html2canvas(printRef.current, {
      scale: 2, 
      logging: false,
      useCORS: true, 
      backgroundColor: '#FFFFFF', 
      windowWidth: 302, 
    });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.loading('Generando PDF...', { id: 'pdf' });
      const canvas = await generateTicketCanvas();
      if (!canvas) throw new Error("No se pudo generar la captura");

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 80; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight + 10] 
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket-${venta.correlativo}.pdf`);
      
      toast.success('PDF descargado', { id: 'pdf' });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar PDF', { id: 'pdf' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      toast.loading('Generando Imagen...', { id: 'img' });
      const canvas = await generateTicketCanvas();
      if (!canvas) throw new Error("No se pudo generar la captura");

      const imgData = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Ticket-${venta.correlativo}.png`;
      link.click();
      
      toast.success('Imagen descargada', { id: 'img' });
    } catch (error) {
      console.error(error);
      toast.error('Error al descargar imagen', { id: 'img' });
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleCopyImage = async () => {
    if (!('ClipboardItem' in window)) {
      toast.error('Tu navegador no soporta copiar imágenes al portapapeles.');
      return;
    }

    try {
      setIsCopyingImage(true);
      toast.loading('Copiando al portapapeles...', { id: 'copy' });
      const canvas = await generateTicketCanvas();
      if (!canvas) throw new Error("No se pudo generar la captura");

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("No se pudo crear el archivo de imagen");
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('¡Imagen copiada! Ya puedes pegarla en WhatsApp.', { id: 'copy' });
        } catch (err) {
          throw err;
        }
      }, 'image/png');

    } catch (error) {
      console.error(error);
      toast.error('Error al copiar imagen', { id: 'copy' });
    } finally {
      setIsCopyingImage(false);
    }
  };

  return (
    <>
      {/* Contenedor Oculto para Generación de Imágenes */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef} style={{ width: '302px' }}>
          <ThermalSaleReceipt 
            configEmpresa={config}
            datosTienda={tiendaActual}
            venta={venta}
            detalles={cartClone}
            cajeroNombre={user?.nombre || 'Cajero'}
            vuelto={vuelto}
            pagoRecibido={pagoRecibido}
            className="" 
          />
        </div>
      </div>

      {/* Plantilla Nativa para Impresora (Oculta en pantalla normal) */}
      <ThermalSaleReceipt 
        configEmpresa={config}
        datosTienda={tiendaActual}
        venta={venta}
        detalles={cartClone}
        cajeroNombre={user?.nombre || 'Cajero'}
        vuelto={vuelto}
        pagoRecibido={pagoRecibido}
        className="print-only-ticket" 
      />

      {/* Modal Visual UI */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] relative border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-300 transition-colors">
          
          {/* Header */}
          <div className="bg-emerald-500 p-4 sm:p-5 text-center text-white relative rounded-t-3xl shrink-0">
            <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-900 transition-colors">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-wide">VENTA REGISTRADA</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 sm:mt-1">{venta.correlativo}</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-6 pt-10 sm:p-8 sm:pt-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-1">S/ {venta.totalFinal.toFixed(2)}</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 sm:mb-6">Total Cobrado</p>
              
              {vuelto > 0 && (
                <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3 sm:p-4 flex justify-between items-center shadow-inner transition-colors">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm sm:text-base">Vuelto a entregar:</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">S/ {vuelto.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/40 space-y-4 sm:space-y-5 transition-colors">
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Impresión en Papel</h4>
                <button 
                  type="button"
                  onClick={handlePrint} 
                  disabled={!config || !tiendaActual} 
                  className="w-full py-3 sm:py-4 bg-slate-800 dark:bg-slate-800 text-white text-sm sm:text-base font-bold rounded-2xl flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition-colors shadow-md disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-2.5" /> IMPRIMIR TICKET
                </button>
              </div>

              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Compartir (Digital)</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button 
                    type="button"
                    onClick={handleCopyImage}
                    disabled={isCopyingImage || !config}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-primary dark:hover:text-blue-400 transition-all disabled:opacity-50 group"
                  >
                    <Copy className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-bold">Copiar Imagen</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isDownloadingImage || !config}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:text-primary dark:hover:text-blue-400 transition-all disabled:opacity-50 group"
                  >
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5 sm:mb-2 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-bold">Descargar PNG</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF || !config}
                    className="col-span-2 flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-300 dark:hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400 transition-all disabled:opacity-50 group"
                  >
                    {/* ✅ SOLUCIÓN: Cambiado 'dark:text-red-400' por 'dark:group-hover:text-red-400' para disipar el conflicto css */}
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    <span className="text-[11px] sm:text-sm font-bold">Descargar PDF</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 rounded-b-3xl transition-colors">
              <button onClick={onNewSale} className="w-full py-3.5 sm:py-4 bg-primary dark:bg-blue-600 text-white text-sm sm:text-base font-bold rounded-2xl flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-lg">
                INICIAR NUEVA VENTA <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};