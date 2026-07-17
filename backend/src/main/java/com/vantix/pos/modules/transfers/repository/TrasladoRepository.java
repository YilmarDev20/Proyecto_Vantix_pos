package com.vantix.pos.modules.transfers.repository;

import com.vantix.pos.modules.transfers.entity.Traslado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrasladoRepository extends JpaRepository<Traslado, Integer> {

    // Para generar el correlativo autoincremental
    long count();

    // Consulta mágica: Trae los traslados donde la tienda actual sea el ORIGEN o el DESTINO
    // Esto es clave para tu regla de negocio de visibilidad
    @Query("SELECT t FROM Traslado t WHERE t.tiendaOrigenId = :tiendaId OR t.tiendaDestinoId = :tiendaId ORDER BY t.fechaCreacion DESC")
    List<Traslado> findAllByTiendaRelacionada(@Param("tiendaId") Integer tiendaId);
}