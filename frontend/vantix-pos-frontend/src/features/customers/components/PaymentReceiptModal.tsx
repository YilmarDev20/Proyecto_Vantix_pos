import { useEffect, useState, useRef } from 'react';
import { Printer, Copy, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { Modal } from '@/components/ui/Modal';
import { ThermalPaymentReceipt } from '@/components/print/ThermalPaymentReceipt';
import { CompanySettingsService } from '@/features/company/services/company.api';
import { StoreService } from '@/features/stores/services/stores.api';
import { useStore } from '@/core/store/context/StoreContext';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  abono: any | null; 
  cliente: any | null; 
}

export const PaymentReceiptModal = ({ isOpen, onClose, abono, cliente }: PaymentReceiptModalProps) => {
  const { activeStoreId } = useStore();
  
  const [config, setConfig] = useState<any>(null);
  const [tiendaActual, setTiendaActual] = useState<any>(null);
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && abono && cliente) {
      const loadPrintData = async () => {
        try {
          const [empresaData, tiendaData] = await Promise.all([
            CompanySettingsService.getSettings(),
            StoreService.getById(activeStoreId || 1)
          ]);
          setConfig(empresaData);
          setTiendaActual(tiendaData);
        } catch (error) {
          console.error("Error cargando datos de impresión:", error);
        }
      };
      loadPrintData();
    }
  }, [isOpen, activeStoreId, abono, cliente]);

  if (!isOpen || !abono || !cliente) return null;

  const montoAbono = parseFloat(abono.montoTotal || abono.monto || 0);
  const deudaPendiente = cliente.deudaActual || 0;
  const deudaAnterior = deudaPendiente + montoAbono;

  const handlePrint = () => window.print();

  const generateCanvas = async () => {
    if (!printRef.current) return null;
    return await html2canvas(printRef.current, {
      scale: 2, logging: false, useCORS: true, backgroundColor: '#FFFFFF', windowWidth: 302, 
    });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      toast.loading('Generando PDF...', { id: 'pdf' });
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Error en captura");
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 80; 
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width; 
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight + 10] });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recibo-Abono-${cliente.nombreCompleto.replace(/\s+/g, '-')}.pdf`);
      toast.success('PDF descargado', { id: 'pdf' });
    } catch (error) {
      toast.error('Error al generar PDF', { id: 'pdf' });
    } finally { setIsGeneratingPDF(false); }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloadingImage(true);
      toast.loading('Descargando imagen...', { id: 'img' });
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Error en captura");
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Recibo-Abono-${cliente.nombreCompleto.replace(/\s+/g, '-')}.png`;
      link.click();
      toast.success('Imagen descargada', { id: 'img' });
    } catch (error) {
      toast.error('Error al descargar imagen', { id: 'img' });
    } finally { setIsDownloadingImage(false); }
  };

  const handleCopyImage = async () => {
    try {
      setIsCopyingImage(true);
      toast.loading('Copiando al portapapeles...', { id: 'copy' });
      const canvas = await generateCanvas();
      if (!canvas) throw new Error("Error en captura");
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Error de blob");
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('¡Copiado! Pégalo en WhatsApp.', { id: 'copy' });
      }, 'image/png');
    } catch (error) {
      toast.error('Error al copiar', { id: 'copy' });
    } finally { setIsCopyingImage(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de Abono" maxWidth="sm">
      <div className="flex flex-col max-h-[80vh]">
        
        {/* PLANTILLA OCULTA */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={printRef} style={{ width: '302px' }}>
            <ThermalPaymentReceipt configEmpresa={config} datosTienda={tiendaActual} cliente={cliente} abono={abono} className="" />
          </div>
        </div>

        {/* PLANTILLA IMPRESORA */}
        <ThermalPaymentReceipt configEmpresa={config} datosTienda={tiendaActual} cliente={cliente} abono={abono} className="print-only-ticket" />

        {/* VISTA VISUAL DEL MODAL */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-900 shadow-sm transition-colors">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
              <span>Deuda Anterior:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">S/ {deudaAnterior.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 mb-3">
              <span>Abono ({abono.metodoPago || abono.metodo}):</span>
              <span className="font-bold">- S/ {montoAbono.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase">Deuda Pendiente:</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">S/ {deudaPendiente.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 space-y-3 transition-colors">
          <button type="button" onClick={handlePrint} disabled={!config} className="w-full py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50 border border-transparent">
            <Printer className="w-5 h-5 mr-2" /> IMPRIMIR RECIBO
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={handleCopyImage} disabled={isCopyingImage || !config} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all disabled:opacity-50 group">
              <Copy className="w-5 h-5 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              <span className="text-[11px] font-bold">Copiar Imagen</span>
            </button>
            <button type="button" onClick={handleDownloadImage} disabled={isDownloadingImage || !config} className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all disabled:opacity-50 group">
              <Download className="w-5 h-5 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              <span className="text-[11px] font-bold">Descargar Imagen</span>
            </button>
            <button type="button" onClick={handleGeneratePDF} disabled={isGeneratingPDF || !config} className="col-span-2 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all disabled:opacity-50 group">
              <FileText className="w-5 h-5 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              <span className="text-xs font-bold">Descargar PDF (Térmico)</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};