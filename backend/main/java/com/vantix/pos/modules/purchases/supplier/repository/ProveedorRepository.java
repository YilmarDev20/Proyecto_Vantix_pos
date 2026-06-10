package com.vantix.pos.modules.purchases.supplier.repository;

import com.vantix.pos.modules.purchases.supplier.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    List<Proveedor> findByEstadoTrueOrderByRazonSocialAsc();
    Optional<Proveedor> findByDocumento(String documento);
    boolean existsByDocumento(String documento);
    List<Proveedor> findAllByOrderByRazonSocialAsc();
}