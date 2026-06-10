import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, CreditCard, Wallet, History, AlertCircle, HandCoins } from 'lucide-react';
import { toast } from 'sonner';

import { CustomerService } from '../services/customer.api';
import { AbonoService } from '../services/abono.api';
import { HistoryService } from '@/features/history/services/history.api';
import { FinancesService } from '@/features/finances/services/finances.api'; 

import type { Customer } from '../types/customer.types';
import type { AbonoResponse, MetodoPagoVenta } from '../types/abono.types';
import type { VentaResponse } from '@/features/pos/types/pos.types';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileSalesTab } from '../components/ProfileSalesTab';
import { ProfilePaymentsTab } from '../components/ProfilePaymentsTab';
import { PaymentModal } from '../components/PaymentModal'; 
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';

export const CustomerProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<Customer | null>(null);
  const [ventas, setVentas] = useState<VentaResponse[]>([]);
  const [abonos, setAbonos] = useState<AbonoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'RESUMEN' | 'VENTAS' | 'ABONOS'>('RESUMEN');
  const [abonoToVoid, setAbonoToVoid] = useState<AbonoResponse | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastAbonoGenerado, setLastAbonoGenerado] = useState<any>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [clienteData, abonosData, ventasData] = await Promise.all([
        CustomerService.getById(Number(id)),
        AbonoService.obtenerHistorial(Number(id)),
        HistoryService.getVentasPorCliente(Number(id))
      ]);
      setCliente(clienteData);
      setAbonos(abonosData);
      setVentas(ventasData);
    } catch (error) {
      toast.error('Error al cargar el perfil del cliente');
      navigate('/customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAnularAbono = async () => {
    if (!abonoToVoid) return;
    try {
      await AbonoService.anularAbono(abonoToVoid.id);
      toast.success('Abono anulado. La deuda ha retornado a los tickets.');
      setAbonoToVoid(null);
      loadData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al anular el abono');
    }
  };

  const handleRegisterPayment = async (monto: number, metodo: MetodoPagoVenta, referencia?: string) => {
    if (!cliente) return;
    
    try {
      setIsSubmittingPayment(true);
      
      const turnoActivo = await FinancesService.getTurnoActivo(1);
      if (!turnoActivo) {
        toast.error('No hay un turno de caja abierto. Abra caja para recibir pagos.');
        return;
      }

      const nuevoAbono = await AbonoService.registrarAbono({
        clienteId: cliente.id,
        turnoCajaId: turnoActivo.id,
        montoTotal: monto,
        metodoPago: metodo,
        referencia: referencia
      });

      setIsPaymentModalOpen(false);
      await loadData(); 

      setLastAbonoGenerado(nuevoAbono);
      setIsReceiptModalOpen(true);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">Cargando perfil...</div>;
  if (!cliente) return null;

  const saldoDisponible = cliente.lineaCreditoMaxima - cliente.deudaActual;
  const porcentajeUso = cliente.lineaCreditoMaxima > 0 ? (cliente.deudaActual / cliente.lineaCreditoMaxima) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <button type="button" onClick={() => navigate('/customers')} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">{cliente.nombreCompleto}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {cliente.tipoDocumento}: {cliente.numeroDocumento} | Creado: {new Date(cliente.fechaCreacion).toLocaleDateString()}
            </p>
          </div>
        </div>

        {cliente.deudaActual > 0 && (
          <button 
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <HandCoins className="w-5 h-5 mr-2" />
            Registrar Abono
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center"><Wallet className="w-4 h-4 mr-2" /> Deuda Actual</p>
          <p className={`text-4xl font-black ${cliente.deudaActual > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
            S/ {cliente.deudaActual.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Línea de Crédito</p>
          <div className="flex justify-between items-end mb-2 gap-2">
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 transition-colors">S/ {cliente.lineaCreditoMaxima.toFixed(2)}</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Libre: S/ {saldoDisponible.toFixed(2)}</p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden transition-colors">
            <div className={`h-2.5 rounded-full transition-all ${porcentajeUso > 80 ? 'bg-red-500' : 'bg-primary dark:bg-blue-600'}`} style={{ width: `${Math.min(porcentajeUso, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center"><History className="w-4 h-4 mr-2" /> Total Comprado</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 transition-colors">
            S/ {cliente.totalComprado.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors overflow-x-auto">
          <button type="button" onClick={() => setActiveTab('RESUMEN')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap px-4 ${activeTab === 'RESUMEN' ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850'}`}>Resumen</button>
          <button type="button" onClick={() => setActiveTab('VENTAS')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap px-4 ${activeTab === 'VENTAS' ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850'}`}>Ventas</button>
          <button type="button" onClick={() => setActiveTab('ABONOS')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap px-4 ${activeTab === 'ABONOS' ? 'bg-white dark:bg-slate-900 text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850'}`}>Abonos</button>
        </div>

        <div className="p-6">
          {activeTab === 'RESUMEN' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">Datos de Contacto</h3>
                <div className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors">
                  <User className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500" />
                  <span className="font-medium">{cliente.nombreCompleto}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors">
                  <Phone className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500" />
                  <span className="font-medium">{cliente.telefono || 'No registrado'}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 transition-colors">
                  <Mail className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500" />
                  <span className="font-medium">{cliente.email || 'No registrado'}</span>
                </div>
              </div>

              {cliente.deudaActual > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-colors">
                  <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400 mb-3" />
                  <h3 className="text-lg font-black text-amber-800 dark:text-amber-300 mb-1">Cliente con Deuda Activa</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">Puedes registrar el pago haciendo clic en el botón superior.</p>
                  <button type="button" onClick={() => setIsPaymentModalOpen(true)} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm text-sm">
                    Pagar Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'VENTAS' && <ProfileSalesTab ventas={ventas} />}
          {activeTab === 'ABONOS' && <ProfilePaymentsTab abonos={abonos} onAnular={setAbonoToVoid} cliente={cliente} />}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!abonoToVoid} onClose={() => setAbonoToVoid(null)} onConfirm={handleAnularAbono}
        title="Anular Abono" message="¿Estás seguro de anular este pago? El dinero se retirará de tu caja." confirmText="Anular Pago" isDestructive={true}
      />

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} cliente={cliente} onConfirm={handleRegisterPayment} isLoading={isSubmittingPayment} />

      <PaymentReceiptModal isOpen={isReceiptModalOpen} onClose={() => { setIsReceiptModalOpen(false); setLastAbonoGenerado(null); }} abono={lastAbonoGenerado} cliente={cliente} />
    </div>
  );
};