package com.vantix.pos.modules.category.repository;

import com.vantix.pos.modules.category.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    // Usamos los métodos nativos findAll() y findById() para ver también las inactivas
}