package com.vantix.pos.modules.dashboard.repository;
import com.vantix.pos.modules.dashboard.repository.projection.AlertaStockProjection;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DashboardInventarioRepository extends Repository<InventarioTienda, Integer> {
    @Query("""
        SELECT p.nombre AS producto, v.sku AS sku, i.stockActual AS stockActual, i.stockMinimo AS stockMinimo
        FROM InventarioTienda i JOIN i.variante v JOIN v.producto p
        WHERE (:tiendaId IS NULL OR i.tienda.id = :tiendaId) AND i.stockActual <= i.stockMinimo AND v.estado = true
        ORDER BY i.stockActual ASC
    """)
    List<AlertaStockProjection> obtenerAlertasStockCritico(@Param("tiendaId") Integer tiendaId);
}