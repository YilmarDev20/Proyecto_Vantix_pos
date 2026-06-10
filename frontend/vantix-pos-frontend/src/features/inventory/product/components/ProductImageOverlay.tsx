import { X } from 'lucide-react';

interface ProductImageOverlayProps {
  isOpen: boolean;
  imageUrl: string | null;
  productName: string;
  onClose: () => void;
}

export const ProductImageOverlay = ({ isOpen, imageUrl, productName, onClose }: ProductImageOverlayProps) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full relative border border-slate-100 dark:border-slate-800 p-2 animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-red-500 transition-colors z-10 shadow border border-transparent dark:border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
        <img 
          src={`${import.meta.env.VITE_BASE_URL}${imageUrl}`} 
          alt={productName} 
          className="w-full h-auto max-h-[75vh] object-contain rounded-xl bg-slate-50 dark:bg-slate-950 transition-colors"
        />
        <div className="p-3 bg-white dark:bg-slate-900 text-center transition-colors">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
            {productName}
          </span>
        </div>
      </div>
    </div>
  );
};