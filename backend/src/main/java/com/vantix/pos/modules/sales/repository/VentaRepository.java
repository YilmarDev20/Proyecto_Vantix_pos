package com.vantix.pos.modules.sales.repository;

import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.enums.EstadoPagoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    List<Venta> findAllByOrderByFechaVentaDesc();
    long countByTipoComprobante(com.vantix.pos.modules.sales.enums.TipoComprobante tipo);
    List<Venta> findByClienteIdAndEstadoPagoInOrderByFechaVentaAsc(Integer clienteId, List<EstadoPagoVenta> estadosPago);
    List<Venta> findByClienteIdOrderByFechaVentaDesc(Integer clienteId);

    // ---> NUEVO: Consulta para filtrar el historial general por tienda <---
    List<Venta> findByTiendaIdOrderByFechaVentaDesc(Integer tiendaId);
}