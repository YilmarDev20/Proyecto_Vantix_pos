package com.vantix.pos.publico.settings.repository;

import com.vantix.pos.publico.settings.entity.ConfiguracionWeb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionWebRepository extends JpaRepository<ConfiguracionWeb, Long> {
}