import { X } from 'lucide-react';

interface VariantImageOverlayProps {
  isOpen: boolean;
  imageUrl: string | null;
  sku: string;
  onClose: () => void;
}

export const VariantImageOverlay = ({ isOpen, imageUrl, sku, onClose }: VariantImageOverlayProps) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full relative border border-slate-100 p-2 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-500 transition-colors z-10 shadow"
          title="Cerrar vista"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Imagen en alta resolución */}
        <img 
          src={`${import.meta.env.VITE_BASE_URL}${imageUrl}`} 
          alt={`Variante ${sku}`} 
          className="w-full h-auto max-h-[75vh] object-contain rounded-xl bg-slate-50"
        />

        {/* Pie de foto descriptivo */}
        <div className="p-3 bg-white text-center">
          <span className="text-xs font-black font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            SKU: {sku}
          </span>
        </div>
      </div>
    </div>
  );
};