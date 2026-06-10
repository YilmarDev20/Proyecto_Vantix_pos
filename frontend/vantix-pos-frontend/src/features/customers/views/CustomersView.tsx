import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Customer, CustomerRequest } from '../types/customer.types';
import { CustomerService } from '../services/customer.api';
import { AbonoService } from '../services/abono.api'; 
import { FinancesService } from '@/features/finances/services/finances.api'; 

import { CustomerForm } from '../components/CustomerForm';
import { CustomerKpis } from '../components/CustomerKpis';
import { CustomerFilters } from '../components/CustomerFilters';
import { PaymentModal } from '../components/PaymentModal'; 
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';

// Fragmentos Visuales Desacoplados
import { CustomerMobileCards } from '../components/CustomerMobileCards';
import { CustomerTable } from '../components/CustomerTable';

import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { MetodoPagoVenta } from '../types/abono.types';
import { useAuth } from '@/core/auth/context/AuthContext';

export const CustomersView = () => {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [hasDebtFilter, setHasDebtFilter] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); 

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle'>('delete');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastAbonoGenerado, setLastAbonoGenerado] = useState<any>(null);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await CustomerService.getAll();
      setCustomers(data);
    } catch (error) {
      toast.error('Error al cargar la base de datos de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            customer.numeroDocumento.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && customer.estado) || 
                           (statusFilter === 'INACTIVE' && !customer.estado);
      const matchesDebt = hasDebtFilter ? customer.deudaActual > 0 : true;

      return matchesSearch && matchesStatus && matchesDebt;
    });
  }, [customers, searchTerm, statusFilter, hasDebtFilter]);

  const handleSaveCustomer = async (data: CustomerRequest) => {
    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await CustomerService.update(selectedCustomer.id, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        await CustomerService.create(data);
        toast.success('Cliente creado con éxito');
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error('Ocurrió un error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedCustomer) return;
    try {
      if (actionType === 'delete') {
        await CustomerService.delete(selectedCustomer.id);
        toast.success('Cliente eliminado del sistema');
      } else if (actionType === 'toggle') {
        await CustomerService.toggleStatus(selectedCustomer.id);
        toast.success(`Cliente ${selectedCustomer.estado ? 'desactivado' : 'activado'} correctamente`);
      }
      loadCustomers();
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleRegisterPayment = async (monto: number, metodo: MetodoPagoVenta, referencia?: string) => {
    if (!selectedCustomer) return;
    
    try {
      setIsSubmitting(true);
      
      const turnoActivo = await FinancesService.getTurnoActivo(1);
      if (!turnoActivo) {
        toast.error('No hay un turno de caja abierto. Abra caja para recibir pagos.');
        return;
      }

      const nuevoAbono = await AbonoService.registrarAbono({
        clienteId: selectedCustomer.id,
        turnoCajaId: turnoActivo.id,
        montoTotal: monto,
        metodoPago: metodo,
        referencia: referencia 
      });

      setIsPaymentModalOpen(false);
      await loadCustomers(); 
      
      const updatedCustomer = await CustomerService.getById(selectedCustomer.id);
      setSelectedCustomer(updatedCustomer);

      setLastAbonoGenerado(nuevoAbono);
      setIsReceiptModalOpen(true);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (customer: Customer) => { setSelectedCustomer(customer); setIsModalOpen(true); };
  const openToggleStatus = (customer: Customer) => { setSelectedCustomer(customer); setActionType('toggle'); setIsConfirmOpen(true); };
  const openSmartDelete = (customer: Customer) => { setSelectedCustomer(customer); setActionType('delete'); setIsConfirmOpen(true); };
  const openPayment = (customer: Customer) => { setSelectedCustomer(customer); setIsPaymentModalOpen(true); };

  const viewProfile = (customer: Customer) => {
    navigate(`/customers/profile/${customer.id}`);
  };

  return (
    // ✅ SOLUCIÓN: Eliminamos overflow-hidden del padre para permitir el flujo natural del scroll en dispositivos móviles
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <CustomerKpis customers={customers} />

      {/* ✅ SOLUCIÓN: Cambiado overflow-hidden a overflow-visible en móviles, manteniendo aislamiento responsive */}
      <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible md:overflow-hidden mt-6 transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Directorio de Clientes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestión de contactos, historial y líneas de crédito.</p>
          </div>
          <button 
            type="button" 
            onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }} 
            className="flex items-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm text-sm border border-transparent"
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo Cliente
          </button>
        </div>

        <CustomerFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} hasDebtFilter={hasDebtFilter} setHasDebtFilter={setHasDebtFilter} />
        
        {/* Renderizado de tarjetas responsivas para celulares */}
        <CustomerMobileCards 
          customers={filteredCustomers} 
          isLoading={isLoading} 
          isAdmin={isAdmin}
          onEdit={openEdit} 
          onToggleStatus={openToggleStatus} 
          onDelete={openSmartDelete} 
          onPay={openPayment} 
          onViewProfile={viewProfile} 
        />

        {/* Renderizado de la tabla fluida para computadoras */}
        <CustomerTable 
          customers={filteredCustomers} 
          isLoading={isLoading} 
          isAdmin={isAdmin}
          onEdit={openEdit} 
          onToggleStatus={openToggleStatus} 
          onDelete={openSmartDelete} 
          onPay={openPayment} 
          onViewProfile={viewProfile} 
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <CustomerForm initialData={selectedCustomer} onSubmit={handleSaveCustomer} onCancel={() => setIsModalOpen(false)} isLoading={isSubmitting} />
      </Modal>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmAction} title="¿Estás seguro?" message={actionType === 'toggle' ? `¿Deseas ${selectedCustomer?.estado ? 'desactivar' : 'activar'} a este cliente?` : (selectedCustomer && (selectedCustomer.totalComprado > 0 || selectedCustomer.deudaActual > 0) ? `Este cliente tiene historial. Por seguridad, no se borrará, solo se DESACTIVARÁ.` : `Se eliminará permanentemente a este cliente.`)} confirmText={actionType === 'toggle' ? 'Confirmar' : (selectedCustomer && (selectedCustomer.totalComprado > 0 || selectedCustomer.deudaActual > 0) ? 'Desactivar' : 'Eliminar Permanentemente')} isDestructive={actionType === 'delete'} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} cliente={selectedCustomer} onConfirm={handleRegisterPayment} isLoading={isSubmitting} />
      
      <PaymentReceiptModal isOpen={isReceiptModalOpen} onClose={() => { setIsReceiptModalOpen(false); setLastAbonoGenerado(null); }} abono={lastAbonoGenerado} cliente={selectedCustomer} />
    </div>
  );
};