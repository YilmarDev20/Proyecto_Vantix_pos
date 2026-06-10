package com.vantix.pos.modules.reports.inventory.repository;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.reports.inventory.repository.projection.InventarioStockProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReporteInventarioRepository extends Repository<Variante, Integer> {

    @Query("""
        SELECT 
            v.id AS varianteId, v.sku AS sku, p.nombre AS nombreProducto, p.marca AS marca,
            CAST(v.atributos AS text) AS atributosJson, v.costoPromedio AS costo, v.precioVenta AS precio,
            COALESCE(SUM(it.stockActual), 0) AS stockActual,
            MAX(it.stockMinimo) AS stockMinimo,
            (SELECT COALESCE(SUM(vd.cantidad * vd.factorConversion), 0) FROM VentaDetalle vd 
             JOIN vd.venta venta WHERE vd.variante.id = v.id AND (:tiendaId IS NULL OR venta.tiendaId = :tiendaId)
             AND venta.estadoVenta = 'COMPLETADA' AND venta.fechaVenta >= :fechaInicio) AS ventasTotales
        FROM Variante v JOIN v.producto p JOIN InventarioTienda it ON it.variante.id = v.id
        WHERE (:tiendaId IS NULL OR it.tienda.id = :tiendaId) AND v.estado = true AND p.estado = true
        GROUP BY v.id, v.sku, p.nombre, p.marca, CAST(v.atributos AS text), v.costoPromedio, v.precioVenta
        ORDER BY ventasTotales DESC, stockActual ASC
    """)
    List<InventarioStockProjection> analizarComportamientoInventario(@Param("tiendaId") Integer tiendaId, @Param("fechaInicio") LocalDateTime fechaInicio);
}