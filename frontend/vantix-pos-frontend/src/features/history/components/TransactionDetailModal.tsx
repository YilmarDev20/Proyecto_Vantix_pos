import { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { Modal } from '@/components/ui/Modal';
import { ThermalSaleReceipt } from '@/components/print/ThermalSaleReceipt';
import { A4QuoteDocument } from '@/components/print/A4QuoteDocument';
import { CompanySettingsService } from '@/features/company/services/company.api';
import { StoreService } from '@/features/stores/services/stores.api';
import { useStore } from '@/core/store/context/StoreContext';
import { useAuth } from '@/core/auth/context/AuthContext';
import type { Transaction } from '../types/history.types';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalleVenta: Transaction | null;
  isLoading: boolean;
}

export const TransactionDetailModal = ({ isOpen, onClose, detalleVenta, isLoading }: TransactionDetailModalProps) => {
  const { user } = useAuth();
  const { activeStoreId } = useStore();
  
  const [config, setConfig] = useState<any>(null);
  const [tiendaActual, setTiendaActual] = useState<any>(null);
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const thermalRef = useRef<HTMLDivElement>(null);
  const a4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && detalleVenta) {
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
  }, [isOpen, activeStoreId, user, detalleVenta]);

  if (!isOpen) return null;

  const isCotizacion = detalleVenta?.tipoComprobante === 'COTIZACION';

  const handlePrint = () => window.print();

  const generateThermalCanvas = async () => {
    if (!thermalRef.current) return null;
    return await html2canvas(thermalRef.current, {
      scale: 2, logging: false, useCORS: true, backgroundColor: '#FFFFFF', windowWidth: 302, 
    });
  };

  const generateA4Canvas = async () => {
    if (!a4Ref.current) return null;
    return await html2canvas(a4Ref.current, {
      scale: 2, logging: false, useCORS: true, backgroundColor: '#FFFFFF', windowWidth: 794 
    });
  };

  const handleGeneratePDF = async () => {
    if (!detalleVenta) return;
    try {
      setIsGeneratingPDF(true);
      toast.loading('Generando PDF...', { id: 'pdf' });
      
      const canvas = isCotizacion ? await generateA4Canvas() : await generateThermalCanvas();
      if (!canvas) throw new Error("Error en captura");
      
      const imgData = canvas.toDataURL('image/png');
      
      let pdf;
      if (isCotizacion) {
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        const pdfWidth = 80; 
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
        pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight + 10] });
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`${isCotizacion ? 'Cotizacion' : 'Comprobante'}-${detalleVenta.correlativo}.pdf`);
      toast.success('PDF descargado', { id: 'pdf' });
    } catch (error) {
      toast.error('Error al generar PDF', { id: 'pdf' });
    } finally { setIsGeneratingPDF(false); }
  };

  const handleDownloadImage = async () => {
    if (!detalleVenta) return;
    try {
      setIsDownloadingImage(true);
      toast.loading('Generando Imagen...', { id: 'img' });
      const canvas = await generateThermalCanvas(); 
      if (!canvas) throw new Error("Error en captura");
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Comprobante-${detalleVenta.correlativo}.png`;
      link.click();
      toast.success('Imagen descargada', { id: 'img' });
    } catch (error) {
      toast.error('Error al descargar imagen', { id: 'img' });
    } finally { setIsDownloadingImage(false); }
  };

  const handleCopyImage = async () => {
    try {
      setIsCopyingImage(true);
      toast.loading('Copiando...', { id: 'copy' });
      const canvas = await generateThermalCanvas();
      if (!canvas) throw new Error("Error en captura");
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Error de blob");
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('¡Copiado para WhatsApp!', { id: 'copy' });
      }, 'image/png');
    } catch (error) {
      toast.error('Error al copiar', { id: 'copy' });
    } finally { setIsCopyingImage(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de ${isCotizacion ? 'Cotización' : 'Venta'}`} maxWidth="md">
      {isLoading ? (
        <div className="py-10 text-center text-slate-500 dark:text-slate-400 italic">Cargando detalles...</div>
      ) : detalleVenta ? (
        <div className="flex flex-col max-h-[80vh]">
          
          {/* PLANTILLA TÉRMICA OCULTA */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div ref={thermalRef} style={{ width: '302px' }}>
              <ThermalSaleReceipt 
                configEmpresa={config} datosTienda={tiendaActual} venta={detalleVenta}
                detalles={detalleVenta.detalles || []} cajeroNombre={user?.nombre || 'Cajero'}
                pagoRecibido={detalleVenta.totalFinal} vuelto={0} className="" 
              />
            </div>
          </div>

          {/* PLANTILLA A4 OCULTA */}
          {isCotizacion && (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <div ref={a4Ref} style={{ width: '794px' }}>
                <A4QuoteDocument 
                  configEmpresa={config} datosTienda={tiendaActual} cotizacion={detalleVenta}
                  detalles={detalleVenta.detalles || []}
                />
              </div>
            </div>
          )}

          {/* PLANTILLA NATIVA IMPRESORA */}
          <ThermalSaleReceipt 
            configEmpresa={config} datosTienda={tiendaActual} venta={detalleVenta}
            detalles={detalleVenta.detalles || []} cajeroNombre={user?.nombre || 'Cajero'}
            pagoRecibido={detalleVenta.totalFinal} vuelto={0} className="print-only-ticket" 
          />

          <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-4 custom-scrollbar">
            <div className={`p-4 rounded-xl border flex justify-between items-center transition-colors ${isCotizacion ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'}`}>
              <div>
                <p className={`text-xs font-bold uppercase transition-colors ${isCotizacion ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isCotizacion ? 'Cotización' : 'Correlativo'}
                </p>
                <p className="font-black text-lg text-slate-800 dark:text-slate-200 transition-colors">{detalleVenta.correlativo}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold uppercase transition-colors ${isCotizacion ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>Total</p>
                <p className="font-black text-2xl text-primary dark:text-blue-400 transition-colors">S/ {detalleVenta.totalFinal.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Productos ({detalleVenta.detalles?.length})</p>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-colors">
                {detalleVenta.detalles?.map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-tight">{d.cantidad}x {d.nombreProductoHistorico}</span>
                    </div>
                    <span className="font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">S/ {d.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900 transition-colors">
            <button type="button" onClick={handlePrint} disabled={!config} className="w-full py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50 border border-transparent">
              <Printer className="w-5 h-5 mr-2" /> IMPRIMIR TICKET FÍSICO
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={handleCopyImage} disabled={isCopyingImage || !config} className={`flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-all disabled:opacity-50 group ${isCotizacion ? 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-400' : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-primary dark:hover:text-blue-400 text-slate-600 dark:text-slate-400'}`}>
                <Copy className={`w-5 h-5 mb-1 transition-colors ${isCotizacion ? 'group-hover:text-amber-500 dark:group-hover:text-amber-400' : 'group-hover:text-primary dark:group-hover:text-blue-400'}`} />
                <span className="text-[11px] font-bold">Copiar Imagen</span>
              </button>
              
              <button type="button" onClick={handleDownloadImage} disabled={isDownloadingImage || !config} className={`flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl transition-all disabled:opacity-50 group ${isCotizacion ? 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-400' : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-primary dark:hover:text-blue-400 text-slate-600 dark:text-slate-400'}`}>
                <Download className={`w-5 h-5 mb-1 transition-colors ${isCotizacion ? 'group-hover:text-amber-500 dark:group-hover:text-amber-400' : 'group-hover:text-primary dark:group-hover:text-blue-400'}`} />
                <span className="text-[11px] font-bold">Descargar Imagen</span>
              </button>
              
              <button type="button" onClick={handleGeneratePDF} disabled={isGeneratingPDF || !config} className={`col-span-2 flex flex-col items-center justify-center p-3 border rounded-xl transition-all disabled:opacity-50 group ${isCotizacion ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400'}`}>
                <FileText className={`w-5 h-5 mb-1 transition-colors ${isCotizacion ? 'text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300' : 'group-hover:text-red-600 dark:group-hover:text-red-400'}`} />
                <span className="text-xs font-bold">{isCotizacion ? 'Descargar PDF Formato A4' : 'Descargar Comprobante PDF'}</span>
              </button>
            </div>
          </div>

        </div>
      ) : null}
    </Modal>
  );
};