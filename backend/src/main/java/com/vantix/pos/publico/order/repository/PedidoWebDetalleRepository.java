package com.vantix.pos.publico.order.repository;

import com.vantix.pos.publico.order.model.PedidoWebDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoWebDetalleRepository extends JpaRepository<PedidoWebDetalle, Long> {
}