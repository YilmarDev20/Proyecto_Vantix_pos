package com.vantix.pos.modules.settings.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ConfiguracionEmpresaResponseDTO {
    private Integer id;
    private String razonSocial;
    private String rucNit;
    private String direccionFiscal;
    private String moneda;
    private String simboloMoneda;
    private String impuestoNombre;
    private BigDecimal impuestoPorcentaje;
    private String logoUrl;
    private LocalDateTime fechaActualizacion;
}