package com.vantix.pos.modules.customer.repository;

import com.vantix.pos.modules.customer.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    List<Cliente> findAllByEstadoTrue();
    Optional<Cliente> findByIdAndEstadoTrue(Integer id);
    boolean existsByNumeroDocumentoAndEstadoTrue(String numeroDocumento);
}