package com.vantix.pos.modules.settings.service;

import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaRequestDTO;
import com.vantix.pos.modules.settings.dto.ConfiguracionEmpresaResponseDTO;

public interface ConfiguracionEmpresaService {
    ConfiguracionEmpresaResponseDTO obtenerConfiguracion();
    ConfiguracionEmpresaResponseDTO actualizarConfiguracion(ConfiguracionEmpresaRequestDTO request);
    ConfiguracionEmpresaResponseDTO actualizarLogo(String logoUrl);
}