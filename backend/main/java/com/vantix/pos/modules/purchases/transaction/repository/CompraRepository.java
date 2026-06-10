package com.vantix.pos.modules.purchases.transaction.repository;

import com.vantix.pos.modules.purchases.transaction.entity.Compra;
import com.vantix.pos.modules.purchases.transaction.enums.EstadoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    List<Compra> findAllByOrderByFechaRegistroDesc();
    List<Compra> findByEstadoCompraOrderByFechaCompraAsc(EstadoCompra estado);

    // ---> NUEVO: Filtramos por tienda <---
    List<Compra> findByTiendaIdOrderByFechaRegistroDesc(Integer tiendaId);
    List<Compra> findByTiendaIdAndEstadoCompraOrderByFechaCompraAsc(Integer tiendaId, EstadoCompra estado);
}