export interface ThermalReceiptProps {
  configEmpresa: any;
  datosTienda: any;
  venta: any;
  detalles: any[];
  cajeroNombre: string;
  vuelto?: number;
  pagoRecibido?: number;
  className?: string;
}

export const ThermalSaleReceipt = ({ 
  configEmpresa, 
  datosTienda, 
  venta, 
  detalles, 
  vuelto = 0, 
  pagoRecibido = 0,
  className = "print-only-ticket"
}: ThermalReceiptProps) => {

  if (!configEmpresa || !datosTienda || !venta) return null;

  const moneySymbol = configEmpresa.simboloMoneda || 'S/';
  const isCotizacion = venta.tipoComprobante === 'COTIZACION';

  // ---> TELÉFONO FIJO (QUEMADO) COMO LO PEDISTE <---
  const telefonoMostrar = "943062716";
  const direccionMostrar = datosTienda.direccion || configEmpresa.direccionFiscal;

  // Función para asegurar que la primera letra siempre sea Mayúscula (Ej: durafan -> Durafan)
  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className={className}>
      <style>
        {`
          .zarely-ticket-container {
            width: 80mm; 
            padding: 0;
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #1a1a1a;
            line-height: 1.25;
            background-color: #ffffff;
          }
          .ticket-inner-padding { padding: 0 4mm; }
          .ticket-divider { border: 0; border-top: 1px dashed #cccccc; margin: 6px 0; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }

          @media print {
            body * { visibility: hidden; }
            .print-only-ticket, .print-only-ticket * { visibility: visible; }
            .print-only-ticket { position: absolute; left: 0; top: 0; width: 80mm; }
            .zarely-ticket-container { color: #000; }
            @page { margin: 0; }
          }
          @media screen { .print-only-ticket { display: none; } }
        `}
      </style>

      <div className="zarely-ticket-container">
        <div className="ticket-inner-padding">
          
          {/* CABECERA */}
          <div className="text-center" style={{ marginBottom: '6px', paddingTop: '8px' }}>
            {configEmpresa.logoUrl && (
              <img 
                src={configEmpresa.logoUrl} 
                alt="Logo Empresa" 
                style={{ display: 'block', margin: '0 auto 6px auto', maxWidth: '70%', maxHeight: '65px', objectFit: 'contain' }} 
              />
            )}
            <div className="font-bold uppercase" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{configEmpresa.razonSocial}</div>
            <div className="font-bold">RUC: {configEmpresa.rucNit}</div>
            <div style={{ fontSize: '11px', color: '#4a4a4a' }}>
              {direccionMostrar}
              {telefonoMostrar && <span> | Telf: {telefonoMostrar}</span>}
            </div>
          </div>

          <hr className="ticket-divider" />
          
          {/* TÍTULO INTELIGENTE */}
          <div className="text-center" style={{ margin: '4px 0' }}>
            <div className="font-bold uppercase" style={{ fontSize: '13px', letterSpacing: '1px' }}>
              {isCotizacion ? 'COTIZACIÓN' : 
               venta.tipoComprobante === 'BOLETA' ? 'Boleta de Venta' : 
               venta.tipoComprobante === 'FACTURA' ? 'Factura Electrónica' : 'Ticket de Venta'}
            </div>
            <div className="font-bold" style={{ fontSize: '15px' }}>
              {venta.correlativo}
            </div>
          </div>

          <hr className="ticket-divider" />

          {/* DATOS CLIENTE */}
          <div style={{ textAlign: 'left', fontSize: '11px', color: '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="font-bold">FECHA:</span> 
              <span>{new Date(venta.fechaVenta).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div><span className="font-bold">CLIENTE:</span> {venta.clienteNombre || 'Cliente General'}</div>
            {venta.clienteDocumento && <div><span className="font-bold">DOC:</span> {venta.clienteDocumento}</div>}
          </div>

          <hr className="ticket-divider" />

          {/* PRODUCTOS */}
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '11px', marginTop: '4px' }}>
            <thead>
              <tr style={{ color: '#666' }}>
                <th style={{ width: '12%', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Cant</th>
                <th style={{ width: '63%', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Descripción</th>
                <th style={{ width: '25%', textAlign: 'right', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((item, idx) => {
                let nombreImpresion = "";

                if (item.variante) {
                  // =========================================================
                  // CUANDO SE IMPRIME DESDE EL PUNTO DE VENTA (NUEVO FORMATO)
                  // =========================================================
                  const v = item.variante;
                  nombreImpresion = v.productoNombre || "Producto";
                  
                  // 1. Marca con paréntesis y capitalizada
                  if (v.marcaNombre) {
                    nombreImpresion += ` (${capitalize(v.marcaNombre)})`;
                  }
                  
                  // 2. Atributos: Un solo guion y separados por comas
                  if (v.atributos && Object.keys(v.atributos).length > 0) {
                    const attrsComas = Object.values(v.atributos)
                      .filter(Boolean)
                      .map(val => capitalize(String(val)))
                      .join(', ');
                    nombreImpresion += ` - ${attrsComas}`;
                  }
                  
                  // 3. Barra vertical SOLO si es Pack Cerrado
                  if (item.presentacion) {
                    const factor = item.presentacion.factorConversion;
                    nombreImpresion += ` | ${capitalize(item.presentacion.nombre)}${factor > 1 ? ` (x${factor})` : ''}`;
                  }

                } else {
                  // =========================================================
                  // CUANDO SE IMPRIME DESDE EL HISTORIAL (RECUPERANDO DATOS)
                  // =========================================================
                  nombreImpresion = item.nombreProductoHistorico || `SKU: ${item.sku || 'N/A'}`;
                  
                  // Cambiar corchetes viejos a paréntesis
                  nombreImpresion = nombreImpresion.replace(/\[/g, '(').replace(/\]/g, ')');
                  
                  // Eliminar el feo (SKU) que metía el backend viejo. Ej: (UTIL-4-8D6203)
                  nombreImpresion = nombreImpresion.replace(/\s*\([A-Z0-9]+-[A-Z0-9-]+\)/i, '');
                  
                  const factor = item.factorConversion || item.presentacionFactorConversion || 1;
                  
                  if (factor > 1) {
                    // Si el backend viejo lo guardó con " - Caja", lo transformamos en barra " | Caja (x6)"
                    if (nombreImpresion.includes(' - ') && !nombreImpresion.includes(' | ')) {
                        const partes = nombreImpresion.split(' - ');
                        const packName = partes.pop()?.trim() || ''; 
                        const base = partes.join(' - ').trim();
                        nombreImpresion = `${base} | ${capitalize(packName)} (x${factor})`;
                    } 
                    // Si ya tiene el formato nuevo con " | " (gracias a la actualización del Backend)
                    else if (nombreImpresion.includes(' | ')) {
                        if (!nombreImpresion.includes(`(x`)) {
                            nombreImpresion += ` (x${factor})`;
                        }
                    }
                  }
                }

                const precio = item.precioUnitario || item.precioHistorico || 0;
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ verticalAlign: 'top', paddingTop: '4px', paddingBottom: '4px', fontWeight: 'bold', color: '#000' }}>
                      {item.cantidad}
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '4px', paddingBottom: '4px', paddingRight: '2px', color: '#222' }}>
                      {nombreImpresion}
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '4px', paddingBottom: '4px', textAlign: 'right', fontWeight: 'bold', color: '#000', fontSize: '12px' }}>
                      {(precio * item.cantidad).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* TOTALES */}
          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #eee' }}>
            {venta.descuentoTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666' }}>
                <span>Subtotal:</span><span>{moneySymbol} {(venta.totalFinal + venta.descuentoTotal).toFixed(2)}</span>
              </div>
            )}
            {venta.descuentoTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#e53e3e', marginBottom: '4px' }}>
                <span>Descuento:</span><span>- {moneySymbol} {venta.descuentoTotal.toFixed(2)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', marginBottom: '4px' }}>
              <span className="font-bold uppercase" style={{ fontSize: '13px' }}>TOTAL:</span>
              <span className="font-bold" style={{ fontSize: '17px', color: '#000' }}>{moneySymbol} {venta.totalFinal.toFixed(2)}</span>
            </div>
            
            {/* PAGOS */}
            {!isCotizacion && (
              <>
                {venta.pagos && venta.pagos.length > 0 ? (
                  venta.pagos.map((pago: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4a4a4a', marginTop: idx === 0 ? '4px' : '2px', paddingTop: idx === 0 ? '4px' : '0', borderTop: idx === 0 ? '1px dashed #eaeaea' : 'none' }}>
                      <span className="font-bold uppercase">PAGO ({pago.metodoPago}):</span><span>{moneySymbol} {pago.montoPagado.toFixed(2)}</span>
                    </div>
                  ))
                ) : pagoRecibido > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4a4a4a', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #eaeaea' }}>
                    <span className="font-bold uppercase">PAGADO CON:</span><span>{moneySymbol} {pagoRecibido.toFixed(2)}</span>
                  </div>
                )}
                {pagoRecibido > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                    <span className="font-bold">VUELTO:</span><span className="font-bold" style={{ color: '#000' }}>{moneySymbol} {vuelto.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <hr className="ticket-divider" style={{ marginTop: '8px' }} />

          {/* PIE DE PÁGINA */}
          <div className="text-center" style={{ marginTop: '8px', paddingBottom: '6px' }}>
            <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#4a4a4a', marginBottom: '4px' }}>
              {isCotizacion ? "Validez: 7 días calendario." : (datosTienda.mensajeTicket || "¡Gracias por su preferencia!")}
            </div>
            <div style={{ fontSize: '9px', color: '#a0a0a0' }}>www.vantixpos.com</div>
          </div>
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  );
};