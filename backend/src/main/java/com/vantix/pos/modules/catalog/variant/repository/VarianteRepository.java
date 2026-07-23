package com.vantix.pos.modules.catalog.variant.repository;

import com.vantix.pos.modules.catalog.variant.entity.Variante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VarianteRepository extends JpaRepository<Variante, Integer> {

    List<Variante> findByProductoId(Integer productoId);

    boolean existsByCodigoBarras(String codigoBarras);
    boolean existsByCodigoBarrasAndIdNot(String codigoBarras, Integer id);

    // 🚀 REGLA DE NEGOCIO EMPRESARIAL:
    // Muestra solo si el Producto Padre está ACTIVO y PUBLICADO,
    // Y la Variante individual está ACTIVA y PUBLICADA.
    @Query("SELECT DISTINCT v FROM Variante v " +
            "JOIN FETCH v.producto p " +
            "LEFT JOIN FETCH v.presentaciones pres " +
            "WHERE v.estado = true " +
            "AND v.publicadoEnWeb = true " +
            "AND p.estado = true " +
            "AND p.publicadoEnWeb = true")
    List<Variante> findAllPublicasParaWeb();
}