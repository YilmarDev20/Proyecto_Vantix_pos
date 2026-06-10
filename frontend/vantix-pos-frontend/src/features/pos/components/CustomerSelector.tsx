import { useState, useEffect, useRef } from 'react';
import { User, Search, X, Plus, UserPlus } from 'lucide-react';
import { CustomerService } from '@/features/customers/services/customer.api';
import type { Customer, CustomerRequest } from '@/features/customers/types/customer.types';
import { CustomerForm } from '@/features/customers/components/CustomerForm'; 
import { toast } from 'sonner';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export const CustomerSelector = ({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await CustomerService.getAll();
      setCustomers(data.filter(c => c.estado));
    } catch (error) {
      toast.error('Error al cargar la lista de clientes');
    }
  };

  useEffect(() => {
    fetchCustomers();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = searchTerm.trim() === '' 
    ? [] 
    : customers.filter(c => 
        c.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.numeroDocumento.includes(searchTerm)
      ).slice(0, 5);

  const handleCreateCustomer = async (data: CustomerRequest) => {
    try {
      setIsCreating(true);
      const newCustomer = await CustomerService.create(data);
      toast.success('Cliente creado y asignado');
      setCustomers(prev => [...prev, newCustomer]);
      onSelectCustomer(newCustomer);
      setIsNewCustomerModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {selectedCustomer ? (
        <div className="p-0 animate-in fade-in zoom-in-95 duration-200">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Cliente Asignado</label>
          {/* ✅ ADAPTACIÓN: Caja de cliente asignado adaptada a tonos noche traslúcidos */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm transition-colors">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-primary dark:bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-800 dark:text-slate-200 text-xs truncate max-w-[140px] leading-tight">{selectedCustomer.nombreCompleto}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{selectedCustomer.numeroDocumento}</p>
              </div>
            </div>
            <button onClick={() => onSelectCustomer(null)} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-0 animate-in fade-in duration-300">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Asignar Cliente (Opcional)</label>
          <div className="flex space-x-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
              {/* ✅ ADAPTACIÓN: Input buscador con foco oscuro */}
              <input 
                type="text" 
                placeholder="DNI o Nombre..." 
                value={searchTerm}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(true);
                }}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-primary dark:focus:border-blue-500 outline-none focus:bg-white dark:focus:bg-slate-900 transition-all bg-slate-100/50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <button 
              type="button"
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="px-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* RESULTADOS COMPATIBLES CON MODO OSCURO */}
          {isSearching && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
              {filteredCustomers.length === 0 ? (
                <div className="p-5 text-center bg-slate-50 dark:bg-slate-950/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3 italic">No se encontró al cliente.</p>
                  <button onClick={() => { setIsSearching(false); setIsNewCustomerModalOpen(true); }} className="w-full py-2 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-[10px] font-black text-primary dark:text-blue-400 hover:border-primary dark:hover:border-blue-400 transition-colors flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 mr-2" /> CREAR NUEVO CLIENTE
                  </button>
                </div>
              ) : (
                <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                  {filteredCustomers.map(c => (
                    <div key={c.id} onClick={() => { onSelectCustomer(c); setSearchTerm(''); setIsSearching(false); }} className="p-3.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group">
                      <p className="font-black text-slate-800 dark:text-slate-200 text-xs group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{c.nombreCompleto}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{c.numeroDocumento}</p>
                        {c.lineaCreditoMaxima > 0 && (
                          <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">CRÉDITO: S/ {(c.lineaCreditoMaxima - c.deudaActual).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL NUEVO CLIENTE */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-transparent dark:border-slate-800">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center uppercase tracking-tighter">
                <UserPlus className="w-5 h-5 mr-2 text-primary dark:text-blue-400" /> Nuevo Cliente Rápido
              </h2>
              <button onClick={() => setIsNewCustomerModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto scrollbar-hide">
              <CustomerForm onSubmit={handleCreateCustomer} onCancel={() => setIsNewCustomerModalOpen(false)} isLoading={isCreating} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};