package com.vantix.pos.modules.store.repository;

import com.vantix.pos.modules.store.entity.Tienda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TiendaRepository extends JpaRepository<Tienda, Integer> {
    // Para quitarle la estrellita a la tienda anterior
    List<Tienda> findByEsPrincipalTrue();

}