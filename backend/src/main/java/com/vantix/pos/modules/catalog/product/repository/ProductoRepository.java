package com.vantix.pos.modules.catalog.product.repository;

import com.vantix.pos.modules.catalog.product.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
}