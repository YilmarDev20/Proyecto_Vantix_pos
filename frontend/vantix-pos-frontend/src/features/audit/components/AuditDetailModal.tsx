import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Terminal, UserCircle, MapPin, ArrowRight } from 'lucide-react';
import type { AuditoriaLog } from '../types/audit.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  log: AuditoriaLog | null;
}

export const AuditDetailModal = ({ isOpen, onClose, log }: Props) => {
  const [showRawData, setShowRawData] = useState(false);

  if (!log) return null;

  const getDifferences = () => {
    try {
      const oldObj = log.valoresAnteriores ? JSON.parse(log.valoresAnteriores) : {};
      const newObj = log.valoresNuevos ? JSON.parse(log.valoresNuevos) : {};
      const changes: { key: string, oldVal: any, newVal: any }[] = [];

      const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

      allKeys.forEach(key => {
        if (['fechaModificacion', 'fechaCreacion', 'presentaciones'].includes(key)) return; 
        
        const oldVal = oldObj[key];
        const newVal = newObj[key];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({
            key,
            oldVal: oldVal !== undefined && oldVal !== null ? String(oldVal) : 'Vacío',
            newVal: newVal !== undefined && newVal !== null ? String(newVal) : 'Vacío'
          });
        }
      });
      return changes;
    } catch (e) {
      return [];
    }
  };

  const differences = getDifferences();

  const parseJsonStr = (jsonStr: string | null) => {
    if (!jsonStr) return 'N/A';
    try { return JSON.stringify(JSON.parse(jsonStr), null, 2); } 
    catch (e) { return jsonStr; }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setShowRawData(false); }} title={`Detalle del Evento: ${log.accion}`}>
      <div className="space-y-4">
        
        {/* INFO BÁSICA */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-colors">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{log.descripcion}</p>
            <div className="flex items-center space-x-4 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
               <span className="flex items-center"><UserCircle className="w-4 h-4 mr-1 text-slate-400 dark:text-slate-500" /> Usuario ID: {log.usuarioId}</span>
               <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400 dark:text-slate-500" /> IP: {log.direccionIp}</span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors border border-transparent dark:border-slate-700"
          >
            <Terminal className="w-4 h-4 mr-1.5" />
            {showRawData ? 'Ver Modo Humano' : 'Ver Modo Programador'}
          </button>
        </div>

        {/* MODO HUMANO (Las Diferencias) */}
        {!showRawData && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-colors">
            <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Resumen de Cambios</span>
            </div>
            
            {differences.length === 0 ? (
               <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">No se detectaron cambios en los campos o fue una creación/eliminación pura.</div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto custom-scrollbar transition-colors">
                {differences.map((diff, index) => (
                  <li key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/40 flex items-center justify-between transition-colors">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm w-1/3">{diff.key}</span>
                    <div className="flex-1 flex items-center justify-end space-x-3 text-sm min-w-0">
                      <span className="text-red-500 dark:text-red-400 font-medium line-through decoration-red-300 dark:decoration-red-900/50 truncate max-w-[120px] sm:max-w-xs">{diff.oldVal}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 truncate max-w-[120px] sm:max-w-xs">{diff.newVal}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* MODO PROGRAMADOR (JSON Crudo) */}
        {showRawData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Valores Anteriores</p>
              <div className="bg-[#1e1e1e] rounded-xl p-4 h-64 overflow-auto border border-slate-800 shadow-inner custom-scrollbar">
                <pre className="text-xs text-red-400 font-mono leading-relaxed">{parseJsonStr(log.valoresAnteriores)}</pre>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Valores Nuevos</p>
              <div className="bg-[#1e1e1e] rounded-xl p-4 h-64 overflow-auto border border-slate-800 shadow-inner custom-scrollbar">
                <pre className="text-xs text-emerald-400 font-mono leading-relaxed">{parseJsonStr(log.valoresNuevos)}</pre>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="button" onClick={() => { onClose(); setShowRawData(false); }} className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm border border-transparent">
            Cerrar Detalles
          </button>
        </div>
      </div>
    </Modal>
  );
};