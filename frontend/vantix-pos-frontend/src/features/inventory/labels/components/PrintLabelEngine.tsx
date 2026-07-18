import { forwardRef } from 'react';
import Barcode from 'react-barcode';

export const PrintLabelEngine = forwardRef(({ cola, formato, razonSocial }: any, ref: any) => {
  const is30x20 = formato === 'TERMICA_30X20';
  const is50x25 = formato === 'TERMICA_50X25';

  // Helper Inteligente: Ensambla el Nombre + [Marca] - Atributos/Variación dinámicamente
  const construirNombreCompleto = (item: any) => {
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

  // Tamaño de fuente adaptativo para proteger el espacio vertical
  const getSmartSize = (text: string, basePt: number) => {
    if (!text) return `${basePt}pt`;
    if (text.length > 25) return `${basePt * 0.75}pt`; 
    if (text.length > 14) return `${basePt * 0.88}pt`;
    return `${basePt}pt`;
  };

  // Detector de simbología comercial o interna según el JSON
  const obtenerFormatoBarcode = (valor: string) => {
    if (!valor) return 'CODE128';
    const limpio = valor.trim();
    if (/^\d{13}$/.test(limpio)) return 'EAN13';
    if (/^\d{8}$/.test(limpio)) return 'EAN8';
    return 'CODE128';
  };

  const nombreEmpresa = (razonSocial && razonSocial !== 'Cargando...') 
    ? razonSocial 
    : 'ZARELY MODA & ACCESORIOS';

  // 🔥 ANCHO PERFECTO PRESERVADO: Mantenemos la calibración exacta que funcionó en tus pruebas
  const barcodeWidth = is50x25 ? 2.0 : 1.4; 
  // Altura calibrada proporcionalmente para dar espacio limpio a los textos y pies de página
  const barcodeHeight = is50x25 ? 38 : 24; 

  return (
    <div ref={ref} className="print-container">
      <style>{`
        @media print {
          @page {
            size: ${is50x25 ? '50mm 25mm' : '30mm 20mm'};
            margin: 0;
          }
          body { margin: 0; padding: 0; background: #fff; }
          * { box-sizing: border-box; color: #000; font-family: sans-serif; }

          /* CONTENEDOR DE LA ETIQUETA */
          .ticket-wrapper {
            width: ${is50x25 ? '50mm' : '30mm'};
            height: ${is50x25 ? '25mm' : '20mm'};
            /* Colchón de seguridad optimizado para el nuevo ancho de barras */
            padding: ${is50x25 ? '1.5mm 3.5mm 1mm 3.5mm' : '0.8mm 1.5mm 0.5mm 1.5mm'};
            page-break-after: always;
            page-break-inside: avoid;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
          }
          .ticket-wrapper:last-child { page-break-after: auto; }

          /* CABECERA (DATOS DE PRODUCTO Y MARCA) */
          .ticket-header { 
            width: 100%; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 0.1mm; 
          }
          
          .ticket-store { 
            font-weight: 800; 
            text-transform: uppercase; 
            text-align: center; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            width: 100%; 
            line-height: 1; 
          }
          
          .ticket-title { 
            font-weight: 700; 
            text-align: center; 
            width: 100%; 
            line-height: 1.05;
            white-space: normal !important;
            display: -webkit-box !important;
            -webkit-line-clamp: ${is30x20 ? '1' : '2'} !important; 
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }

          /* ÁREA DEL CÓDIGO DE BARRAS PRESERVADA */
          .ticket-barcode { 
            width: 100%; 
            flex: 1; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            overflow: hidden;
            margin: 0.2mm 0; 
          }
          /* Mantenemos el estiramiento horizontal al 98% que abrió los espacios blancos */
          .ticket-barcode svg { 
            max-width: 98% !important; 
            height: ${barcodeHeight}px !important; 
            object-fit: fill; 
          }

          /* PIE DE PÁGINA (PREFIJO/SKU Y PRECIO) */
          .ticket-footer { 
            width: 100%; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
            line-height: 1;
            padding: 0 0.5mm; 
          }
          
          .ticket-sku { 
            font-weight: 600; 
            font-family: monospace; 
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            max-width: 52%; 
          }
          
          .ticket-price { 
            font-weight: 900; 
            white-space: nowrap; 
          }
        }
      `}</style>

      {cola.map((item: any) => {
        const productoNombreCompleto = construirNombreCompleto(item);
        const valorCodigo = item.codigoBarras || item.sku || '';
        const tipoFormato = obtenerFormatoBarcode(valorCodigo);

        return Array.from({ length: item.cantidadImprimir }).map((_, i: number) => (
          <div key={`${item.id}-${i}`} className="ticket-wrapper">
            
            {/* TEXTOS SUPERIORES */}
            <div className="ticket-header">
              {!is30x20 && (
                <div className="ticket-store" style={{ fontSize: getSmartSize(nombreEmpresa, 5.5) }}>
                  {nombreEmpresa}
                </div>
              )}
              <div className="ticket-title" style={{ fontSize: getSmartSize(productoNombreCompleto, is50x25 ? 7.5 : 5.2) }}>
                {productoNombreCompleto}
              </div>
            </div>

            {/* CÓDIGO DE BARRAS CON ANCHO CORREGIDO */}
            <div className="ticket-barcode">
              <Barcode 
                value={valorCodigo} 
                format={tipoFormato}
                width={barcodeWidth} 
                height={barcodeHeight} 
                margin={0}
                displayValue={false} 
              />
            </div>

            {/* TEXTOS INFERIORES */}
            <div className="ticket-footer">
              <span className="ticket-sku" style={{ fontSize: is50x25 ? '6.5pt' : '4.8pt' }}>
                {item.sku}
              </span>
              <div className="ticket-price" style={{ fontSize: is50x25 ? '13pt' : '9.5pt' }}>
                S/ {item.precioVenta.toFixed(2)}
              </div>
            </div>

          </div>
        ));
      })}
    </div>
  );
});

PrintLabelEngine.displayName = "PrintLabelEngine";