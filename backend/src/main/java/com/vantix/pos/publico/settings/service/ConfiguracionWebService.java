package com.vantix.pos.publico.settings.service;

import com.vantix.pos.publico.settings.dto.ConfiguracionWebDTO;

public interface ConfiguracionWebService {
    ConfiguracionWebDTO obtenerConfiguracion();
    ConfiguracionWebDTO guardarOActualizarConfiguracion(ConfiguracionWebDTO dto);
}