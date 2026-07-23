import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode; 
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'; 
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl', 
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl', // 🚀 ANCHO PANORÁMICO PARA PC (1280px)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-colors">
      <div 
        className={`bg-white dark:bg-slate-900 w-full h-full md:h-auto rounded-none md:rounded-2xl shadow-xl dark:shadow-slate-950 ${maxWidthClasses[maxWidth]} md:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800 transition-colors`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center transition-colors">
            {title}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 md:p-6 overflow-y-auto flex-1 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};