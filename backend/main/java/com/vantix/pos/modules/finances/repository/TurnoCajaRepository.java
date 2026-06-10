package com.vantix.pos.modules.finances.repository;

import com.vantix.pos.modules.finances.entity.TurnoCaja;
import com.vantix.pos.modules.finances.enums.EstadoTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TurnoCajaRepository extends JpaRepository<TurnoCaja, Integer> {

    Optional<TurnoCaja> findByTiendaIdAndUsuarioIdAndEstadoTurno(Integer tiendaId, Integer usuarioId, EstadoTurno estadoTurno);

    // Para una tienda específica
    List<TurnoCaja> findAllByTiendaIdOrderByFechaAperturaDesc(Integer tiendaId);

    // ---> NUEVO: Para la Visión Global (trae todo de todas las tiendas) <---
    List<TurnoCaja> findAllByOrderByFechaAperturaDesc();
}