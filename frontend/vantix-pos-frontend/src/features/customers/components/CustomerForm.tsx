import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Customer, CustomerRequest } from '../types/customer.types';
import { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/core/auth/context/AuthContext';
import { SecurityService } from '@/core/auth/services/security.api';
import { toast } from 'sonner';

const solamenteNumeros = /^[0-9]+$/;

const customerSchema = z.object({
  tipoDocumento: z.string().min(1, "Seleccione un tipo"),
  numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
  nombreCompleto: z.string().min(3, "El nombre es muy corto"),
  telefono: z.string()
    .regex(solamenteNumeros, "El celular solo debe contener números")
    .length(9, "El celular debe tener exactamente 9 dígitos")
    .startsWith("9", "El celular debe iniciar con el dígito 9"),
  email: z.string().email("Correo inválido").optional().or(z.literal('')),
  lineaCreditoMaxima: z.coerce.number().min(0, "No puede ser negativo")
}).superRefine((data, ctx) => {
  const numDoc = data.numeroDocumento;

  if (!solamenteNumeros.test(numDoc)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El documento solo debe contener números",
      path: ["numeroDocumento"]
    });
    return;
  }

  if (data.tipoDocumento === 'DNI' && numDoc.length !== 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El DNI debe tener exactamente 8 dígitos",
      path: ["numeroDocumento"]
    });
  }

  if (data.tipoDocumento === 'RUC') {
    if (numDoc.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUC debe tener exactamente 11 dígitos",
        path: ["numeroDocumento"]
      });
    } else if (!numDoc.startsWith('10') && !numDoc.startsWith('20')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUC debe iniciar con 10 o 20",
        path: ["numeroDocumento"]
      });
    }
  }
});

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: CustomerRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CustomerForm = ({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';

  const [isLocked, setIsLocked] = useState(!isAdmin);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombreCompleto: '',
      telefono: '',
      email: '',
      lineaCreditoMaxima: 0
    }
  });

  const currentTipoDoc = watch('tipoDocumento');

  useEffect(() => {
    if (initialData) {
      reset({
        tipoDocumento: initialData.tipoDocumento || 'DNI',
        numeroDocumento: initialData.numeroDocumento || '',
        nombreCompleto: initialData.nombreCompleto,
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        lineaCreditoMaxima: initialData.lineaCreditoMaxima
      });
    } else {
      reset({ tipoDocumento: 'DNI', numeroDocumento: '', nombreCompleto: '', telefono: '', email: '', lineaCreditoMaxima: 0 }); 
    }
  }, [initialData, reset]);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  // ✅ REPARADO: Se removieron los atributos 'name' duplicados de los inputs y se unificó la lógica del onChange de RHF
  const handleNumericSanitize = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'numeroDocumento' | 'telefono') => {
    const { value } = e.target;
    const sanitized = value.replace(/[^0-9]/g, '');
    
    if (fieldName === 'numeroDocumento') {
      const maxLen = currentTipoDoc === 'DNI' ? 8 : currentTipoDoc === 'RUC' ? 11 : 15;
      if (sanitized.length > maxLen) return;
    }
    if (fieldName === 'telefono' && sanitized.length > 9) return;

    setValue(fieldName, sanitized, { shouldValidate: true });
  };

  const handleUnlock = async () => {
    if (pin.length !== 4) return;
    
    setIsVerifying(true);
    const isValid = await SecurityService.verificarPin(pin);
    setIsVerifying(false);

    if (isValid) {
      toast.success("Campo de crédito desbloqueado por 30 segundos.");
      setIsLocked(false);
      setShowPinInput(false);
      setPin('');

      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => {
        setIsLocked(true);
        toast.info("El campo de crédito se ha vuelto a bloquear por seguridad.");
      }, 30000);

    } else {
      toast.error("El PIN es incorrecto o ya expiró.");
      setPin('');
    }
  };

  const handleFormSubmit = (data: any) => {
    onSubmit(data as CustomerRequest);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo Doc.</label>
          <select {...register('tipoDocumento')} className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium">
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="CE">Carnet Ext.</option>
          </select>
          {errors.tipoDocumento && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.tipoDocumento.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Número de Documento *</label>
          <input 
            type="text" 
            inputMode="numeric"
            placeholder={currentTipoDoc === 'DNI' ? '8 dígitos' : currentTipoDoc === 'RUC' ? '11 dígitos' : 'Número...'}
            {...register('numeroDocumento')} 
            onChange={(e) => handleNumericSanitize(e, 'numeroDocumento')}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all text-sm font-medium ${errors.numeroDocumento ? 'border-red-400 dark:border-red-900/50' : 'border-slate-300 dark:border-slate-700'}`} 
          />
          {errors.numeroDocumento && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0" /> {String(errors.numeroDocumento.message)}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo / Razón Social *</label>
        <input type="text" {...register('nombreCompleto')} className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all text-sm font-medium ${errors.nombreCompleto ? 'border-red-400 dark:border-red-900/50' : 'border-slate-300 dark:border-slate-700'}`} placeholder="Ej: Doña María o Distribuidora Sac" />
        {errors.nombreCompleto && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center"><ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0" /> {String(errors.nombreCompleto.message)}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Celular *</label>
          <input 
            type="text" 
            inputMode="numeric"
            placeholder="Ej: 987654321" 
            {...register('telefono')} 
            onChange={(e) => handleNumericSanitize(e, 'telefono')}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all text-sm font-medium ${errors.telefono ? 'border-red-400 dark:border-red-900/50' : 'border-slate-300 dark:border-slate-700'}`} 
          />
          {errors.telefono && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0" /> {String(errors.telefono.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email (Opcional)</label>
          <input type="email" {...register('email')} className={`w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors text-sm font-medium ${errors.email ? 'border-red-400 dark:border-red-900/50' : ''}`} placeholder="correo@comercio.com" />
          {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center"><ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0" /> {String(errors.email.message)}</p>}
        </div>
      </div>

      {/* SECCIÓN PROTEGIDA CON PIN */}
      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-4 transition-colors">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Línea de Crédito Máxima (S/)</label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Límite para ventas al fiado. Pon 0 si no tiene crédito.</p>
        
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            step="0.10" 
            {...register('lineaCreditoMaxima')} 
            readOnly={isLocked}
            className={`flex-1 p-2.5 border rounded-lg outline-none transition-all text-sm ${
              isLocked 
                ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed select-none' 
                : 'bg-white dark:bg-slate-900 border-primary dark:border-blue-500 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-bold'
            }`} 
          />
          
          {!isAdmin && (
            <button
              type="button"
              onClick={() => {
                if (isLocked) setShowPinInput(!showPinInput);
                else {
                  setIsLocked(true);
                  if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors flex items-center justify-center border ${
                isLocked 
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40 border-amber-200 dark:border-amber-900/50 shadow-sm' 
                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 border-emerald-200 dark:border-emerald-900/50 shadow-sm'
              }`}
              title={isLocked ? "Desbloquear con PIN de Autorización" : "Bloquear campo"}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          )}
        </div>

        {showPinInput && isLocked && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 transition-colors">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <input
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/, ''))}
              placeholder="PIN"
              className="w-24 p-1.5 text-center tracking-widest font-bold border border-amber-300 dark:border-amber-700 rounded-md outline-none focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 transition-colors text-sm"
              autoFocus
            />
            <button
              type="button"
              onClick={handleUnlock}
              disabled={pin.length !== 4 || isVerifying}
              className="px-3 py-1.5 bg-amber-600 dark:bg-amber-700 text-white font-bold rounded-md hover:bg-amber-700 dark:hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm text-xs"
            >
              {isVerifying ? 'Validando...' : 'Autorizar'}
            </button>
          </div>
        )}

        {errors.lineaCreditoMaxima && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{String(errors.lineaCreditoMaxima.message)}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors text-sm">Cancelar</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2 bg-primary dark:bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md text-sm border border-transparent tracking-wide">
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar Cliente' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  );
};