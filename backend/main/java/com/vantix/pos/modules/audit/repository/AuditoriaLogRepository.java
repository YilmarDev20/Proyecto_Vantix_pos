package com.vantix.pos.modules.audit.repository;

import com.vantix.pos.modules.audit.entity.AuditoriaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaLogRepository extends JpaRepository<AuditoriaLog, Integer> {

    // Para filtrar rápidamente en el frontend
    List<AuditoriaLog> findByModuloOrderByFechaRegistroDesc(String modulo);

    List<AuditoriaLog> findByTiendaIdOrderByFechaRegistroDesc(Integer tiendaId);

    List<AuditoriaLog> findByUsuarioIdOrderByFechaRegistroDesc(Integer usuarioId);
}