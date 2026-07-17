package com.vantix.pos.modules.dashboard.repository;
import com.vantix.pos.modules.dashboard.repository.projection.ClienteVipProjection;
import com.vantix.pos.modules.purchases.transaction.entity.Compra;
import com.vantix.pos.modules.transfers.entity.Traslado;
import com.vantix.pos.modules.customer.entity.Cliente;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DashboardOperacionesRepository extends Repository<Cliente, Integer> {
    // 1. TRASLADOS PENDIENTES
    @Query("SELECT t FROM Traslado t WHERE (:tiendaId IS NULL OR t.tiendaDestinoId = :tiendaId) AND t.estadoTraslado = 'PENDIENTE' ORDER BY t.fechaCreacion ASC")
    List<Traslado> obtenerTrasladosPendientes(@Param("tiendaId") Integer tiendaId);

    // 2. DEUDAS URGENTES (Compras Por Pagar)
    @Query("SELECT c FROM Compra c JOIN FETCH c.proveedor WHERE (:tiendaId IS NULL OR c.tiendaId = :tiendaId) AND c.estadoCompra = 'POR_PAGAR' ORDER BY c.fechaCompra ASC")
    List<Compra> obtenerDeudasPendientes(@Param("tiendaId") Integer tiendaId);

    // 3. RANKING CLIENTES
    @Query("SELECT c.nombreCompleto AS nombre, c.totalComprado AS totalComprado FROM Cliente c WHERE c.estado = true ORDER BY c.totalComprado DESC")
    List<ClienteVipProjection> obtenerTopClientes(Pageable pageable);
}