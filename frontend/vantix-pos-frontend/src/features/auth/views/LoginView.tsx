import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, Hexagon, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/context/AuthContext';
import type { LoginCredentials } from '@/core/auth/types/auth.types';

import { LoginBrandingPanel } from '../components/LoginBrandingPanel';

const loginSchema = z.object({
  email: z.string().email("Ingrese un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export const LoginView = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema)
  });

  const { ref: emailRef, ...emailRest } = register('email');

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('¡Bienvenido al sistema!');
      navigate('/'); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">
      
      {/* ================= PANEL IZQUIERDO: FORMULARIO (Móvil & PC) ================= */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 bg-white dark:bg-slate-950 relative z-10">
        
        {/* Marca superior adaptable */}
        <div className="flex items-center space-x-3 select-none">
          <div className="w-9 h-9 bg-primary/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center border border-primary/20 dark:border-blue-500/30">
            <Hexagon className="w-5 h-5 text-primary dark:text-blue-400" strokeWidth={2} />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Vantix POS</span>
        </div>

        {/* Bloque Central Formulario */}
        {/* ✅ MEJORA PREMIUM: Se le inyectó un slide-in-from-bottom-4 de Tailwind para que los inputs carguen de abajo hacia arriba de forma fluida */}
        <div className="w-full max-w-md mx-auto my-auto pt-8 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">¡Hola de nuevo!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
              Ingresa tus credenciales para acceder a la administración de <span className="text-primary dark:text-blue-400 font-bold">tu comercio</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type="email" 
                  {...emailRest}
                  ref={(e) => {
                    emailRef(e);
                    // @ts-ignore
                    emailInputRef.current = e;
                  }}
                  className={`block w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-0 focus:border-primary dark:focus:border-blue-500 outline-none transition-all font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 ${errors.email ? 'border-red-400 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'}`} 
                  placeholder="usuario@comercio.com" 
                />
              </div>
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert className="w-4 h-4 mr-1 shrink-0" /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')}
                  className={`block w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-0 focus:border-primary dark:focus:border-blue-500 outline-none transition-all font-medium bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 ${errors.password ? 'border-red-400 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'}`} 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  tabIndex={-1} 
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold flex items-center animate-in fade-in slide-in-from-top-1">
                  <ShieldAlert className="w-4 h-4 mr-1 shrink-0" /> {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg hover:shadow-xl text-sm font-black text-white bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] tracking-wider"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                    AUTENTICANDO...
                  </>
                ) : 'INGRESAR AL SISTEMA'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer legal */}
        <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium tracking-wide text-center lg:text-left transition-colors">
          © 2026 Vantix Software. Todos los derechos reservados.
        </p>
      </div>

      {/* ================= PANEL DERECHO ================= */}
      <LoginBrandingPanel />

    </div>
  );
};