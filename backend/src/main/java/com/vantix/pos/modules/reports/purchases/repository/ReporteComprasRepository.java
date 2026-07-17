package com.vantix.pos.modules.reports.purchases.repository;

import com.vantix.pos.modules.purchases.transaction.entity.Compra;
import com.vantix.pos.modules.reports.purchases.repository.projection.DeudaProveedorProjection;
import com.vantix.pos.modules.reports.purchases.repository.projection.HistorialCompraProjection;
import com.vantix.pos.modules.reports.purchases.repository.projection.InversionCategoriaProjection;
import com.vantix.pos.modules.reports.purchases.repository.projection.InversionTiendaProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ReporteComprasRepository extends Repository<Compra, Integer> {

    // 1. TOTAL INVERTIDO EN MERCADERÍA (Filtrado por fecha)
    @Query("""
        SELECT COALESCE(SUM(c.total), 0)
        FROM Compra c
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.estadoCompra != 'ANULADO' 
          AND c.fechaCompra >= :inicio 
          AND c.fechaCompra <= :fin
    """)
    BigDecimal calcularTotalComprasRango(@Param("tiendaId") Integer tiendaId,
                                         @Param("inicio") LocalDateTime inicio,
                                         @Param("fin") LocalDateTime fin);

    // 2. DEUDA TOTAL ACTUAL A PROVEEDORES (Foto en tiempo real)
    @Query("""
        SELECT COALESCE(SUM(c.saldoPendiente), 0)
        FROM Compra c
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.estadoCompra != 'ANULADO'
          AND c.saldoPendiente > 0
    """)
    BigDecimal calcularDeudaTotalProveedores(@Param("tiendaId") Integer tiendaId);

    // 3. RANKING DE PROVEEDORES ADREUDADOS
    @Query("""
        SELECT 
            p.razonSocial AS proveedorNombre,
            p.documento AS documento,
            SUM(c.saldoPendiente) AS montoAdeudado
        FROM Compra c
        JOIN c.proveedor p
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.estadoCompra != 'ANULADO'
          AND c.saldoPendiente > 0
        GROUP BY p.id, p.razonSocial, p.documento
        ORDER BY SUM(c.saldoPendiente) DESC
    """)
    List<DeudaProveedorProjection> obtenerRankingDeudasProveedores(@Param("tiendaId") Integer tiendaId);

    // 4. INVERSIÓN POR CATEGORÍA (Análisis de Inventario)
    @Query("""
        SELECT 
            cat.nombre AS categoria,
            SUM(cd.subtotal) AS total
        FROM CompraDetalle cd
        JOIN cd.compra c
        JOIN cd.variante v
        JOIN v.producto p
        JOIN p.categoria cat
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.estadoCompra != 'ANULADO'
          AND c.fechaCompra >= :inicio
          AND c.fechaCompra <= :fin
        GROUP BY cat.id, cat.nombre
        ORDER BY SUM(cd.subtotal) DESC
    """)
    List<InversionCategoriaProjection> obtenerInversionPorCategoria(@Param("tiendaId") Integer tiendaId,
                                                                    @Param("inicio") LocalDateTime inicio,
                                                                    @Param("fin") LocalDateTime fin);

    // 5. INVERSIÓN POR TIENDA (Solo útil en Visión Global)
    @Query("""
        SELECT 
            c.tiendaId AS tiendaId,
            SUM(c.total) AS total
        FROM Compra c
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.estadoCompra != 'ANULADO'
          AND c.fechaCompra >= :inicio
          AND c.fechaCompra <= :fin
        GROUP BY c.tiendaId
        ORDER BY SUM(c.total) DESC
    """)
    List<InversionTiendaProjection> obtenerInversionPorTienda(@Param("tiendaId") Integer tiendaId,
                                                              @Param("inicio") LocalDateTime inicio,
                                                              @Param("fin") LocalDateTime fin);

    // 6. HISTORIAL DETALLADO DE COMPRAS
    @Query("""
        SELECT 
            c.fechaCompra AS fecha,
            c.numeroComprobante AS comprobante,
            p.razonSocial AS proveedor,
            CAST(c.metodoPago AS string) AS metodoPago,
            CAST(c.estadoCompra AS string) AS estado,
            c.total AS total
        FROM Compra c
        JOIN c.proveedor p
        WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId)
          AND c.fechaCompra >= :inicio
          AND c.fechaCompra <= :fin
        ORDER BY c.fechaCompra DESC
    """)
    List<HistorialCompraProjection> obtenerHistorialCompras(@Param("tiendaId") Integer tiendaId, @Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}