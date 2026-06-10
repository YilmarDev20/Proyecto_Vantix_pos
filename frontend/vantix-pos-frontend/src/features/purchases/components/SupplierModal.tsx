import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { PurchasesService } from '../services/purchases.api';
import type { ProveedorRequest, ProveedorResponse } from '../types/purchases.types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proveedorEditar?: ProveedorResponse | null;
}

const estadoInicial: ProveedorRequest = {
  documento: '',
  razonSocial: '',
  nombreContacto: '',
  telefono: '',
  email: '',
  direccion: ''
};

export const SupplierModal = ({ isOpen, onClose, onSuccess, proveedorEditar }: SupplierModalProps) => {
  const [formData, setFormData] = useState<ProveedorRequest>(estadoInicial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (proveedorEditar) {
      setFormData({
        documento: proveedorEditar.documento,
        razonSocial: proveedorEditar.razonSocial,
        nombreContacto: proveedorEditar.nombreContacto || '',
        telefono: proveedorEditar.telefono || '',
        email: proveedorEditar.email || '',
        direccion: proveedorEditar.direccion || ''
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [proveedorEditar, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'documento' || name === 'telefono') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      
      if (name === 'documento' && soloNumeros.length > 11) return;
      if (name === 'telefono' && soloNumeros.length > 9) return;

      setFormData({ ...formData, [name]: soloNumeros });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documento.trim() || !formData.razonSocial.trim()) {
      toast.error('El RUC/DNI y la Razón Social son obligatorios');
      return;
    }

    const docLength = formData.documento.length;
    if (docLength !== 8 && docLength !== 11) {
      toast.error('El documento debe ser un DNI válido (8 dígitos) o un RUC (11 dígitos)');
      return;
    }

    // ✅ REPARADO: Usamos un fallback (formData.telefono || '') para garantizar a TS que siempre será un string, eliminando el error ts(18048)
    const telefonoCadena = formData.telefono || '';
    if (telefonoCadena.trim()) {
      if (telefonoCadena.length !== 9) {
        toast.error('El número de celular debe tener exactamente 9 dígitos');
        return;
      }
      if (!telefonoCadena.startsWith('9')) {
        toast.error('El número de celular debe comenzar con el dígito 9');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (proveedorEditar) {
        await PurchasesService.actualizarProveedor(proveedorEditar.id, formData);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await PurchasesService.crearProveedor(formData);
        toast.success('Proveedor registrado correctamente');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar el proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={proveedorEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">RUC / DNI *</label>
            <input 
              type="text" 
              name="documento" 
              required
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="8 o 11 dígitos"
              value={formData.documento} 
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Teléfono / Celular</label>
            <input 
              type="text" 
              name="telefono"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej: 987654321"
              value={formData.telefono || ''} 
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Razón Social o Nombre Comercial *</label>
          <input 
            type="text" 
            name="razonSocial" 
            required
            placeholder="Ej: Distribuidora Textil S.A.C."
            value={formData.razonSocial} 
            onChange={handleChange}
            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del Contacto (Vendedor)</label>
          <input 
            type="text" 
            name="nombreContacto"
            placeholder="Ej: Juan Pérez"
            value={formData.nombreContacto || ''} 
            onChange={handleChange}
            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Dirección del Proveedor</label>
          <input 
            type="text" 
            name="direccion"
            placeholder="Ej: Av. Grau 456, Lima"
            value={formData.direccion || ''} 
            onChange={handleChange}
            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-primary dark:focus:border-blue-500 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="px-6 py-2 bg-primary dark:bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors text-sm shadow-sm border border-transparent tracking-wide"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};