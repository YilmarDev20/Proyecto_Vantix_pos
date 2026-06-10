package com.vantix.pos.modules.finances.repository;

import com.vantix.pos.modules.finances.entity.MovimientoCaja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimientoCajaRepository extends JpaRepository<MovimientoCaja, Integer> {
    List<MovimientoCaja> findByTurnoCajaIdOrderByFechaMovimientoDesc(Integer turnoCajaId);
}