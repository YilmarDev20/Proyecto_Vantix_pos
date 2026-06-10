package com.vantix.pos.modules.dashboard.repository;
import com.vantix.pos.modules.finances.entity.TurnoCaja;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface DashboardFinanzasRepository extends Repository<TurnoCaja, Integer> {
    @Query("SELECT COALESCE(SUM(t.montoApertura + t.totalIngresos - t.totalEgresos), 0) FROM TurnoCaja t WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId) AND t.estadoTurno = 'ABIERTO'")
    BigDecimal calcularEfectivoEnCajaActual(@Param("tiendaId") Integer tiendaId);

    @Query("SELECT t FROM TurnoCaja t WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId) AND t.estadoTurno = 'ABIERTO'")
    List<TurnoCaja> obtenerTurnosAbiertos(@Param("tiendaId") Integer tiendaId);
}