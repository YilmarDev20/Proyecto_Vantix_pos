package com.vantix.pos.modules.dashboard.repository;

import com.vantix.pos.modules.dashboard.repository.projection.ProductoTopProjection;
import com.vantix.pos.modules.dashboard.repository.projection.VentasPorHoraProjection;
import com.vantix.pos.modules.sales.entity.Venta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface DashboardVentaRepository extends Repository<Venta, Integer> {
    @Query("SELECT COALESCE(SUM(v.totalFinal), 0) FROM Venta v WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.estadoVenta = 'COMPLETADA' AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin")
    BigDecimal calcularTotalVentasRango(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT COUNT(v) FROM Venta v WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.estadoVenta = 'COMPLETADA' AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin")
    Long contarTicketsRango(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("""
        SELECT vd.nombreProductoHistorico AS nombre, var.sku AS sku, CAST(SUM(vd.cantidad * vd.factorConversion) AS integer) AS cantidadTotal, SUM(vd.subtotal) AS montoTotal
        FROM Venta v JOIN v.detalles vd JOIN vd.variante var
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) AND v.estadoVenta = 'COMPLETADA' AND v.fechaVenta >= :inicio AND v.fechaVenta <= :fin
        GROUP BY var.id, vd.nombreProductoHistorico, var.sku ORDER BY SUM(vd.cantidad * vd.factorConversion) DESC
    """)
    List<ProductoTopProjection> obtenerTopProductos(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin, Pageable pageable);

    @Query("""
        SELECT EXTRACT(HOUR FROM v.fechaVenta) AS hora, SUM(v.totalFinal) AS total 
        FROM Venta v 
        WHERE (:tiendaId IS NULL OR v.tiendaId = :tiendaId) 
          AND v.estadoVenta = 'COMPLETADA' 
          AND v.fechaVenta >= :inicio 
          AND v.fechaVenta <= :fin 
        GROUP BY EXTRACT(HOUR FROM v.fechaVenta) 
        ORDER BY hora ASC
    """)
    List<VentasPorHoraProjection> obtenerVentasPorHora(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}