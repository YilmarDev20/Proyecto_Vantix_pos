import type { CompanySettings } from '../../features/company/types/company.types';

export interface A4QuoteProps {
  configEmpresa: CompanySettings;
  datosTienda: any;
  cotizacion: any;
  detalles: any[];
  vendedorNombre?: string; 
}

export const A4QuoteDocument = ({ configEmpresa, datosTienda, cotizacion, detalles }: A4QuoteProps) => {
  if (!configEmpresa || !cotizacion) return null;

  const moneySymbol = configEmpresa.simboloMoneda || 'S/';

  return (
    <div className="a4-print-container" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', backgroundColor: 'white', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#1e293b', margin: '0 auto', position: 'relative' }}>
      
      {/* ---> EL CEREBRO DE LA PAGINACIÓN A4 PARA IMPRESIÓN <--- */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 15mm 15mm 20mm 15mm; /* Márgenes físicos de la impresora */
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background-color: white;
            }
            /* Quitamos el padding fijo para que la impresora maneje los bordes */
            .a4-print-container {
              width: 100% !important;
              min-height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* MAGIA DE LAS TABLAS MULTIPÁGINA */
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid; /* Evita que una fila se corte por la mitad */
              page-break-after: auto;
            }
            thead {
              display: table-header-group; /* Repite el encabezado azul en cada página nueva */
            }
            tfoot {
              display: table-footer-group; 
            }
            /* CRÍTICO: Quitar el overflow para que el contenido pase a la otra hoja */
            .table-wrapper {
              overflow: visible !important;
              border: none !important; 
              border-radius: 0 !important;
            }
            /* Volvemos a poner el borde, pero a la tabla, no al div */
            .table-wrapper table {
              border: 1px solid #e2e8f0;
            }
            /* Evita que los totales o los textos de abajo se partan por la mitad al final de una hoja */
            .page-break-avoid {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: '#831843' }}></div>

      {/* HEADER CORPORATIVO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '25px', marginBottom: '35px', marginTop: '10px' }}>
        <div style={{ width: '50%' }}>
          {/* El código del logo está perfecto, el problema es de caché al hacer el build */}
          {configEmpresa.logoUrl ? (
            <img src={configEmpresa.logoUrl} alt="Logo" style={{ maxWidth: '200px', maxHeight: '90px', objectFit: 'contain' }} />
          ) : (
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#831843', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{configEmpresa.razonSocial}</h1>
          )}
        </div>
        
        <div style={{ width: '45%', textAlign: 'right' }}>
          <h2 style={{ fontSize: '32px', color: '#831843', margin: '0 0 5px 0', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>PROFORMA</h2>
          <p style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#475569' }}>N° {cotizacion.correlativo}</p>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#64748b' }}>
            <p style={{ margin: 0 }}><strong>RUC:</strong> {configEmpresa.rucNit}</p>
            <p style={{ margin: 0 }}>{datosTienda?.direccion || configEmpresa.direccionFiscal}</p>
            <p style={{ margin: 0 }}>Teléfono: {datosTienda?.telefono || '-'}</p>
          </div>
        </div>
      </div>

      {/* BLOQUE DE DATOS */}
      <div className="page-break-avoid" style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ flex: '1', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0', fontWeight: 'bold' }}>Emitido a:</h3>
          <p style={{ margin: '0 0 6px 0', fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{cotizacion.clienteNombre || 'Cliente General'}</p>
          {cotizacion.clienteDocumento && <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Documento: {cotizacion.clienteDocumento}</p>}
        </div>

        <div style={{ flex: '1', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0', fontWeight: 'bold' }}>Detalles del Documento:</h3>
          <table style={{ width: '100%', fontSize: '13px', color: '#334155' }}>
            <tbody>
              <tr>
                <td style={{ paddingBottom: '8px', fontWeight: '600' }}>Fecha de Emisión:</td>
                <td style={{ paddingBottom: '8px', textAlign: 'right' }}>{new Date(cotizacion.fechaVenta).toLocaleDateString('es-PE')}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600' }}>Validez de Oferta:</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#831843' }}>7 días calendario</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS A4 - Le agregué la clase "table-wrapper" y le quité borderRadius y overflow */}
      <div className="table-wrapper" style={{ border: '1px solid #e2e8f0', marginBottom: '30px', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '14px', textAlign: 'center', width: '10%', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Cant</th>
              <th style={{ padding: '14px', textAlign: 'left', width: '50%', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Descripción del Artículo</th>
              <th style={{ padding: '14px', textAlign: 'right', width: '20%', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Precio Unit.</th>
              <th style={{ padding: '14px', textAlign: 'right', width: '20%', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Total</th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'white' }}>
            {detalles.map((item, idx) => {
              let nombreFinal = "";
              if (item.variante) {
                const v = item.variante;
                nombreFinal = v.productoNombre || "Producto Genérico";
                if (v.marcaNombre) nombreFinal += ` [${v.marcaNombre}]`;
                if (v.atributos && Object.keys(v.atributos).length > 0) {
                  nombreFinal += ` - ${Object.values(v.atributos).filter(Boolean).join(', ')}`;
                }
              } else if (item.nombreProductoHistorico) {
                nombreFinal = item.nombreProductoHistorico.replace(/\s*\([^)]+\)$/, '');
              } else {
                nombreFinal = `SKU: ${item.sku || 'Desconocido'}`;
              }

              const precio = item.precioUnitario || item.precioHistorico || 0;

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{item.cantidad}</td>
                  <td style={{ padding: '16px 14px', textTransform: 'capitalize', color: '#1e293b', fontWeight: '500' }}>
                    {nombreFinal.toLowerCase()}
                  </td>
                  <td style={{ padding: '16px 14px', textAlign: 'right', color: '#475569' }}>{moneySymbol} {precio.toFixed(2)}</td>
                  <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>{moneySymbol} {(precio * item.cantidad).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BLOQUE INFERIOR: INFORMACIÓN ADICIONAL + TOTALES */}
      <div className="page-break-avoid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        {/* TEXTOS AMIGABLES */}
        <div style={{ width: '55%', paddingRight: '20px' }}>
          <h4 style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>Información Adicional</h4>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#475569', lineHeight: '1.8' }}>
            <li>Los precios expresados ya incluyen los impuestos correspondientes (IGV).</li>
            <li>Esta proforma asegura sus precios por un lapso de <strong>7 días calendario</strong>.</li>
            <li>Los productos están sujetos a disponibilidad de stock en tienda física.</li>
            <li>Si tiene alguna duda o consulta, ¡será un placer atenderle!</li>
          </ul>
        </div>

        {/* CAJA DE TOTALES */}
        <div style={{ width: '40%', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {cotizacion.descuentoTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#475569' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>{moneySymbol} {(cotizacion.totalFinal + cotizacion.descuentoTotal).toFixed(2)}</span>
            </div>
          )}
          {cotizacion.descuentoTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#ef4444' }}>
                <span>Descuento Especial:</span>
                <span style={{ fontWeight: 'bold' }}>- {moneySymbol} {cotizacion.descuentoTotal.toFixed(2)}</span>
              </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #cbd5e1', paddingTop: '15px', marginTop: '5px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>Total a Pagar:</span>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#831843' }}>{moneySymbol} {cotizacion.totalFinal.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* PIE DE PÁGINA FINAL */}
      <div className="page-break-avoid" style={{ marginTop: '60px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <p style={{ margin: '0 0 5px 0' }}>¡Gracias por confiar en {configEmpresa.razonSocial} para sus consultas!</p>
        <p style={{ margin: 0 }}>Documento generado por <strong>Vantix POS</strong></p>
      </div>

    </div>
  );
};