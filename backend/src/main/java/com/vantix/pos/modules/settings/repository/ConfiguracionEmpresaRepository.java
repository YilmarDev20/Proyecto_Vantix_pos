package com.vantix.pos.modules.settings.repository;

import com.vantix.pos.modules.settings.entity.ConfiguracionEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionEmpresaRepository extends JpaRepository<ConfiguracionEmpresa, Integer> {
    // Usaremos los métodos nativos (findById)
}