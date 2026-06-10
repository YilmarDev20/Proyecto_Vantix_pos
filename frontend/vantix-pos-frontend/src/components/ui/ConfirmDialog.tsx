import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean; // Si es true, el botón será Rojo. Si es false, será Azul.
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true
}: ConfirmDialogProps) => {
  return (
    // CORRECCIÓN: Se cambió "max-w-sm" por "sm" para respetar el tipado estricto del Modal
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-primary'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        
        <div className="flex space-x-3 w-full">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};