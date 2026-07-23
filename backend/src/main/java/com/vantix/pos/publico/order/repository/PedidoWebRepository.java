package com.vantix.pos.publico.order.repository;

import com.vantix.pos.publico.order.model.PedidoWeb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoWebRepository extends JpaRepository<PedidoWeb, Long> {

    Optional<PedidoWeb> findByCodigoPedido(String codigoPedido);

    List<PedidoWeb> findByTiendaIdOrderByFechaCreacionDesc(Integer tiendaId);

    List<PedidoWeb> findByEstadoOrderByFechaCreacionDesc(PedidoWeb.EstadoPedidoWeb estado);

    List<PedidoWeb> findByTiendaIdAndEstadoOrderByFechaCreacionDesc(Integer tiendaId, PedidoWeb.EstadoPedidoWeb estado);

    List<PedidoWeb> findAllByOrderByFechaCreacionDesc();
}