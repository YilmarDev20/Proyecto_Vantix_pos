import { useState, useEffect } from 'react';
import { useStore } from '@/core/store/context/StoreContext';
import { AuditService } from '../services/audit.api';
import type { AuditoriaLog } from '../types/audit.types';
import { toast } from 'sonner';

import { AuditFilters } from '../components/AuditFilters';
import { AuditTable } from '../components/AuditTable';
import { AuditDetailModal } from '../components/AuditDetailModal';

// ✅ NUEVO IMPORT: Traemos el renderizador móvil desacoplado
import { AuditMobileCards } from '../components/AuditMobileCards';

export const AuditView = () => {
  const { activeStoreId } = useStore();
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [moduloFiltro, setModuloFiltro] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const data = activeStoreId === null 
            ? await AuditService.getAll() 
            : await AuditService.getByStore(activeStoreId);
        setLogs(data);
      } catch (error) {
        toast.error('Error al cargar el registro de auditoría');
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, [activeStoreId]);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    
    const matchSearch = log.descripcion.toLowerCase().includes(term) || 
                        log.accion.toLowerCase().includes(term) ||
                        (log.entidadId !== null && log.entidadId.toString() === term);
                        
    const matchModulo = moduloFiltro === '' || log.modulo === moduloFiltro;
    
    return matchSearch && matchModulo;
  });

  const modulosDisponibles = Array.from(new Set(logs.map(l => l.modulo)));

  return (
    // ✅ ADAPTACIÓN RESPONSIVE: Eliminamos overflow-hidden del contenedor principal en móviles para permitir scroll vertical libre
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible md:overflow-hidden mt-2 transition-colors">
      
      <AuditFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        moduloFiltro={moduloFiltro}
        setModuloFiltro={setModuloFiltro}
        modulosDisponibles={modulosDisponibles}
      />

      <div className="flex-1 overflow-visible md:overflow-auto p-4 md:p-6 custom-scrollbar">
        {/* ✅ RENDERS CONDICIONALES RESPONSIVE */}
        <AuditMobileCards 
          logs={filteredLogs} 
          isLoading={isLoading} 
          onViewDetails={setSelectedLog} 
        />

        <AuditTable 
          logs={filteredLogs} 
          isLoading={isLoading} 
          onViewDetails={setSelectedLog} 
        />
      </div>

      <AuditDetailModal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        log={selectedLog} 
      />
      
    </div>
  );
};