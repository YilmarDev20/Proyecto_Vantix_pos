import { Hexagon } from 'lucide-react';

export const LoginBrandingPanel = () => {
  return (
    <div className="hidden lg:flex flex-1 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-12 relative flex-col justify-between items-start overflow-hidden border-l border-slate-200 dark:border-slate-900 select-none">
      
      {/* Estilos locales inyectados de forma limpia para controlar las micro-interacciones premium */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        .animate-magnetic-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Malla decorativa de fondo */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>
      
      {/* Resplandores abstractos dinámicos descompasados (Evita que parpadeen al mismo tiempo) */}
      <div className="absolute top-12 right-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-12 left-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-40 pointer-events-none animate-pulse duration-[12000ms]"></div>

      {/* Identificador superior */}
      <div className="relative z-10 flex items-center space-x-3 text-white/40">
        <span className="text-xs font-bold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
          Core Engine v4.2
        </span>
      </div>

      {/* Contenido Central de Marketing Multiempresa */}
      <div className="relative z-10 max-w-lg mt-auto mb-auto space-y-5">
        
        {/* ✅ MEJORA PREMIUM: Isotipo flotante con levitación magnética infinita en CSS */}
        <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl transition-all duration-500 group cursor-pointer animate-magnetic-float hover:scale-105 hover:bg-white/10">
          <Hexagon className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-5xl font-black text-white tracking-tight leading-[1.15]">
          Potencia tu negocio, <br />
          <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            simplifica tus ventas.
          </span>
        </h2>
        
        <p className="text-slate-400 text-base font-medium leading-relaxed max-w-md">
          Gestiona inventarios, créditos y operaciones diarias con la velocidad y estabilidad que <span className="text-white font-bold">una empresa moderna</span> exige.
        </p>
      </div>

      {/* Pie de página del panel derecho */}
      <div className="relative z-10 flex justify-between items-center w-full text-xs text-slate-500 dark:text-slate-600 font-bold tracking-wider uppercase border-t border-white/5 pt-4">
        <span>Vantix POS Ecosystem</span>
        <span>Enterprise Edition</span>
      </div>

    </div>
  );
};