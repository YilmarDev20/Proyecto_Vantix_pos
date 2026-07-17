package com.vantix.pos.modules.inventory.stock.repository;

import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventarioTiendaRepository extends JpaRepository<InventarioTienda, Integer> {

    // Este método es oro puro: Busca el stock de un producto específico en una tienda específica
    Optional<InventarioTienda> findByVarianteIdAndTiendaId(Integer varianteId, Integer tiendaId);
    void deleteByVarianteId(Integer varianteId);
}