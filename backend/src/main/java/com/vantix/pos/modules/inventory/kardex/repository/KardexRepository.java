package com.vantix.pos.modules.inventory.kardex.repository;

import com.vantix.pos.modules.inventory.kardex.entity.InventarioKardex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KardexRepository extends JpaRepository<InventarioKardex, Integer> {
    List<InventarioKardex> findByVarianteIdOrderByFechaMovimientoDesc(Integer varianteId);
    List<InventarioKardex> findAllByOrderByFechaMovimientoDesc();

    // ---> NUEVO: Consulta para buscar el historial de una tienda específica <---
    List<InventarioKardex> findByTiendaIdOrderByFechaMovimientoDesc(Integer tiendaId);
}