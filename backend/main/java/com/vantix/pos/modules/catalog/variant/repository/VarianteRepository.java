package com.vantix.pos.modules.catalog.variant.repository;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VarianteRepository extends JpaRepository<Variante, Integer> {
    List<Variante> findByProductoId(Integer productoId);

    // NUEVAS CONSULTAS PARA BLINDAR LA DUPLICIDAD
    boolean existsByCodigoBarras(String codigoBarras);
    boolean existsByCodigoBarrasAndIdNot(String codigoBarras, Integer id);
}