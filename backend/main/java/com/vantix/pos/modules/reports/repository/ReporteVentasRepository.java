package com.vantix.pos.modules.reports.repository;

import com.vantix.pos.modules.reports.repository.projection.ClienteValorProjection;
import com.vantix.pos.modules.reports.repository.projection.VendedorRankingProjection;
import com.vantix.pos.modules.sales.entity.Venta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ReporteVentasRepository extends Repository<Venta, Integer> {

    // 1. VENTAS EXACTAS (El dinero real que entró)
    @Query("""
        SELECT COALESCE(SUM(v.totalFinal), 0) 
        FROM Venta v 
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) 
          AND v.estadoVenta = 'COMPLETADA' 
          AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin
    """)
    BigDecimal calcularVentasTotales(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // 2. COSTOS EXACTOS (Lo que costó la mercadería)
    @Query("""
        SELECT COALESCE(SUM(vd.cantidad * vd.factorConversion * vd.costoUnitarioHistorico), 0) 
        FROM Venta v
        JOIN v.detalles vd
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) 
          AND v.estadoVenta = 'COMPLETADA' 
          AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin
    """)
    BigDecimal calcularCostosTotales(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // 3. RANKING DE VENDEDORES
    @Query("""
        SELECT u.nombre AS nombre, SUM(v.totalFinal) AS totalVendido, COUNT(v) AS cantidadOperaciones
        FROM Venta v JOIN Usuario u ON v.usuarioId = u.id
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.estadoVenta = 'COMPLETADA' 
          AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin
        GROUP BY u.id, u.nombre ORDER BY SUM(v.totalFinal) DESC
    """)
    List<VendedorRankingProjection> obtenerRankingVendedores(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin, Pageable pageable);

    // 4. CLIENTES VIP
    @Query("""
        SELECT c.id AS id, c.numeroDocumento AS documento, c.nombreCompleto AS nombre, SUM(v.totalFinal) AS monto
        FROM Venta v JOIN v.cliente c
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.estadoVenta = 'COMPLETADA'
          AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin
        GROUP BY c.id, c.numeroDocumento, c.nombreCompleto ORDER BY SUM(v.totalFinal) DESC
    """)
    List<ClienteValorProjection> obtenerMejoresClientes(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin, Pageable pageable);

    // 5. DEUDORES EXACTOS
    @Query("""
        SELECT c.id AS id, c.numeroDocumento AS documento, c.nombreCompleto AS nombre, SUM(v.saldoPendiente) AS monto
        FROM Venta v JOIN v.cliente c
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.saldoPendiente > 0 AND v.estadoVenta != 'ANULADA'
        GROUP BY c.id, c.numeroDocumento, c.nombreCompleto ORDER BY SUM(v.saldoPendiente) DESC
    """)
    List<ClienteValorProjection> obtenerDeudoresExactos(@Param("tiendaId") Integer tiendaId, Pageable pageable);
}