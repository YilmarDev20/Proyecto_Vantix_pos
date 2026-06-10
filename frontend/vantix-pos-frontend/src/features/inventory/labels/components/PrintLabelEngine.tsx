import Barcode from 'react-barcode';

export const PrintLabelEngine = ({ cola, formato, razonSocial }: any) => (
  <div id="print-section" className="hidden print:block bg-white w-full">
    <style>{`
      @media print {
        html, body, #root, main, .overflow-y-auto, .overflow-hidden, .h-screen, .h-full, .flex-1 {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
          position: static !important;
        }
        body * { visibility: hidden; }
        #print-section, #print-section * { visibility: visible; }
        #print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        
        /* LÓGICA DE FORMATOS */
        ${formato === 'TERMICA' ? `
          @page { size: 50mm 25mm; margin: 0; }
          .print-label { width: 50mm; height: 25mm; padding: 2mm; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: space-between; page-break-after: always; font-family: sans-serif; overflow: hidden; margin: 0 auto; }
          .lbl-title { font-size: 7pt; font-weight: 800; text-align: center; line-height: 1.1; margin-bottom: 1mm; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; width: 100%; }
        ` : formato === 'A4_NORMAL' ? `
          @page { size: A4 portrait; margin: 10mm; }
          .print-grid { display: flex; flex-wrap: wrap; gap: 3mm; justify-content: flex-start; align-content: flex-start; width: 100%; }
          .print-label { width: 60mm; height: 35mm; border: 1px dashed #ccc; border-radius: 2mm; padding: 2.5mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-sizing: border-box; font-family: sans-serif; overflow: hidden; page-break-inside: avoid; margin-bottom: 2mm; }
          .lbl-title { font-size: 7pt; font-weight: 800; text-align: center; line-height: 1.1; margin-bottom: 1mm; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; width: 100%; }
        ` : ` /* A4_MINI */
          @page { size: A4 portrait; margin: 10mm; }
          .print-grid { display: flex; flex-wrap: wrap; gap: 2mm; justify-content: flex-start; align-content: flex-start; width: 100%; }
          .print-label { width: 45mm; height: 25mm; border: 1px dashed #ccc; border-radius: 2mm; padding: 1.5mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-sizing: border-box; font-family: sans-serif; overflow: hidden; page-break-inside: avoid; margin-bottom: 2mm; }
          .lbl-title { font-size: 5.5pt; font-weight: 800; text-align: center; line-height: 1.1; margin-bottom: 0.5mm; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; width: 100%; }
        `}
        
        .lbl-store { font-size: 5pt; font-weight: 800; color: #555; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lbl-sku { font-size: 6pt; color: #000; font-weight: 600; font-family: monospace; }
        .lbl-price { font-size: 13pt; font-weight: 900; color: #000; line-height: 1; }
        .lbl-footer { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1mm; }
        .lbl-store-info { display: flex; flex-direction: column; justify-content: flex-end; max-width: 60%; }
      }
    `}</style>

    <div className={formato.includes('A4') ? 'print-grid' : ''}>
      {cola.map((item: any) => (
        Array.from({ length: item.cantidadImprimir }).map((_, i: number) => (
          <div key={`${item.id}-${i}`} className="print-label">
            <div className="lbl-title">{item.productoNombre}</div>
            
            <div style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
              <Barcode 
                value={item.codigoBarras || item.sku} 
                width={1.2} 
                height={formato === 'TERMICA' ? 24 : formato === 'A4_MINI' ? 18 : 26} 
                fontSize={8} 
                margin={0}
                displayValue={false}
              />
            </div>

            <div className="lbl-footer">
              <div className="lbl-store-info">
                <span className="lbl-store">{razonSocial}</span>
                <span className="lbl-sku">{item.sku}</span>
              </div>
              <span className="lbl-price">S/ {item.precioVenta.toFixed(2)}</span>
            </div>
          </div>
        ))
      ))}
    </div>
  </div>
);