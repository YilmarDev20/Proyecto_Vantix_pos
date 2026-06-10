export interface ThermalPaymentProps {
  configEmpresa: any;
  datosTienda: any;
  cliente: any; // AHORA RECIBE EL OBJETO CLIENTE COMPLETO
  abono: any;
  className?: string;
}

export const ThermalPaymentReceipt = ({ 
  configEmpresa, 
  datosTienda, 
  cliente, 
  abono, 
  className = "print-only-ticket"
}: ThermalPaymentProps) => {

  if (!configEmpresa || !datosTienda || !abono || !cliente) return null;

  const moneySymbol = configEmpresa.simboloMoneda || 'S/';
  
  // MATEMÁTICA INTELIGENTE
  const montoAbono = parseFloat(abono.montoTotal || abono.monto || 0);
  const deudaPendiente = cliente.deudaActual || 0;
  const deudaAnterior = deudaPendiente + montoAbono;
  
  // CORRECCIÓN DE FECHA
  const fechaExacta = abono.fechaAbono || abono.fechaCreacion || abono.fecha;

  return (
    <div className={className}>
      <style>
        {`
          .zarely-ticket-container {
            width: 80mm; padding: 0; margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px; color: #1a1a1a; line-height: 1.25; background-color: #ffffff;
          }
          .ticket-inner-padding { padding: 0 4mm; }
          .ticket-divider { border: 0; border-top: 1px solid #eaeaea; margin: 8px 0; }
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
          
          <div className="text-center" style={{ marginBottom: '6px', paddingTop: '10px' }}>
            {/* ---> AQUÍ ESTÁ LA CORRECCIÓN DEL LOGO <--- */}
            {configEmpresa.logoUrl && (
              <img src={configEmpresa.logoUrl} alt="Logo Empresa" style={{ display: 'block', margin: '0 auto 6px auto', maxWidth: '70%', maxHeight: '65px', objectFit: 'contain' }} />
            )}
            <div className="font-bold uppercase" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{configEmpresa.razonSocial}</div>
            <div className="font-bold">RUC: {configEmpresa.rucNit}</div>
            <div style={{ fontSize: '11px', color: '#4a4a4a' }}>
              {datosTienda.direccion || configEmpresa.direccionFiscal}
              {datosTienda.telefono && <span> | Telf: {datosTienda.telefono}</span>}
            </div>
          </div>

          <hr className="ticket-divider" />
          
          <div className="text-center" style={{ margin: '8px 0' }}>
            <div className="font-bold uppercase" style={{ fontSize: '14px', letterSpacing: '1px' }}>RECIBO DE PAGO / ABONO</div>
            {abono.id && <div className="font-bold" style={{ fontSize: '12px', color: '#666' }}>OP-{abono.id}</div>}
          </div>

          <hr className="ticket-divider" />

          <div style={{ textAlign: 'left', fontSize: '12px', color: '#333', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="font-bold">FECHA:</span> 
              <span>{fechaExacta ? new Date(fechaExacta).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : 'Fecha no disponible'}</span>
            </div>
            <div>
              <span className="font-bold">CLIENTE:</span> <br/>
              <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>{cliente.nombreCompleto}</span>
            </div>
          </div>

          <hr className="ticket-divider" style={{ borderTop: '2px dashed #000' }} />

          {/* ---> NUEVO BLOQUE MATEMÁTICO <--- */}
          <div style={{ marginTop: '10px', paddingBottom: '5px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4a4a4a', marginBottom: '6px' }}>
              <span>Deuda Anterior:</span>
              <span>{moneySymbol} {deudaAnterior.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#000', fontWeight: 'bold', marginBottom: '6px' }}>
              <span className="uppercase">ABONO ({abono.metodoPago || abono.metodo}):</span>
              <span>- {moneySymbol} {montoAbono.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '4px', marginTop: '6px' }}>
              <span className="font-bold uppercase" style={{ fontSize: '12px' }}>DEUDA PENDIENTE:</span>
              <span className="font-bold" style={{ fontSize: '18px', color: '#000' }}>
                {moneySymbol} {deudaPendiente.toFixed(2)}
              </span>
            </div>

          </div>

          <hr className="ticket-divider" style={{ borderTop: '2px dashed #000' }} />

          <div className="text-center" style={{ marginTop: '12px', paddingBottom: '10px' }}>
            <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#4a4a4a', marginBottom: '4px' }}>¡Gracias por su pago!</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Este documento certifica la recepción del dinero y la actualización de su saldo.</div>
          </div>
          <div style={{ height: '30px' }}></div>
        </div>
      </div>
    </div>
  );
};