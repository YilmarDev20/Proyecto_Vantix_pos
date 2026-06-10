package com.vantix.pos.modules.reports.finances.repository;

import com.vantix.pos.modules.finances.entity.MovimientoCaja;
import com.vantix.pos.modules.reports.finances.repository.projection.FlujoPagoProjection;
import com.vantix.pos.modules.reports.finances.repository.projection.MovimientoCajaProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ReporteFinanzasRepository extends Repository<MovimientoCaja, Integer> {

    @Query("""
        SELECT COALESCE(SUM(m.monto), 0)
        FROM MovimientoCaja m
        JOIN m.turnoCaja t
        WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId)
          AND m.tipoMovimiento = 'INGRESO'
          AND m.fechaMovimiento >= :inicio 
          AND m.fechaMovimiento <= :fin
    """)
    BigDecimal calcularTotalIngresos(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("""
        SELECT COALESCE(SUM(m.monto), 0)
        FROM MovimientoCaja m
        JOIN m.turnoCaja t
        WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId)
          AND m.tipoMovimiento = 'EGRESO'
          AND m.fechaMovimiento >= :inicio 
          AND m.fechaMovimiento <= :fin
    """)
    BigDecimal calcularTotalEgresos(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // ---> CONSULTA BLINDADA CONTRA ANULACIONES <---
    @Query("""
        SELECT 
            CAST(m.metodoPago AS string) AS metodoPago,
            SUM(CASE WHEN m.tipoMovimiento = 'INGRESO' THEN m.monto ELSE -m.monto END) AS totalMonto,
            SUM(CASE WHEN m.tipoMovimiento = 'INGRESO' THEN 1 ELSE 0 END) AS cantidadOperaciones
        FROM MovimientoCaja m
        JOIN m.turnoCaja t
        WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId)
          AND m.fechaMovimiento >= :inicio 
          AND m.fechaMovimiento <= :fin
        GROUP BY m.metodoPago
        HAVING SUM(CASE WHEN m.tipoMovimiento = 'INGRESO' THEN m.monto ELSE -m.monto END) > 0
        ORDER BY totalMonto DESC
    """)
    List<FlujoPagoProjection> obtenerDistribucionPagos(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // ... (Mantén las consultas anteriores de Ingresos, Egresos y Distribución) ...

    // ---> NUEVA CONSULTA PARA LA TABLA DE HISTORIAL <---
    @Query("""
        SELECT 
            m.fechaMovimiento AS fecha,
            CAST(m.tipoMovimiento AS string) AS tipoMovimiento,
            CAST(m.metodoPago AS string) AS metodoPago,
            m.concepto AS concepto,
            m.monto AS monto
        FROM MovimientoCaja m
        JOIN m.turnoCaja t
        WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId)
          AND m.fechaMovimiento >= :inicio 
          AND m.fechaMovimiento <= :fin
        ORDER BY m.fechaMovimiento DESC
    """)
    List<MovimientoCajaProjection> obtenerHistorialMovimientos(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // ---> NUEVA CONSULTA PARA EL FONDO DE APERTURA <---
    @Query("""
        SELECT COALESCE(SUM(t.montoApertura), 0)
        FROM TurnoCaja t
        WHERE (:tiendaId IS NULL OR t.tiendaId = :tiendaId)
          AND t.fechaApertura >= :inicio 
          AND t.fechaApertura <= :fin
    """)
    BigDecimal calcularTotalFondoInicial(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}