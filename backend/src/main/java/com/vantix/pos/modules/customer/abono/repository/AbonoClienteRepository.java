package com.vantix.pos.modules.customer.abono.repository;

import com.vantix.pos.modules.customer.abono.entity.AbonoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbonoClienteRepository extends JpaRepository<AbonoCliente, Integer> {
    List<AbonoCliente> findByClienteIdOrderByFechaAbonoDesc(Integer clienteId);
}