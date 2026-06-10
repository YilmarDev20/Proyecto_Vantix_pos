package com.vantix.pos.modules.settings.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ConfiguracionEmpresaRequestDTO {

    @NotBlank(message = "La razón social es obligatoria")
    private String razonSocial;

    @NotBlank(message = "El RUC/NIT es obligatorio")
    private String rucNit;

    private String direccionFiscal;

    @NotBlank(message = "La moneda es obligatoria")
    private String moneda;

    @NotBlank(message = "El símbolo de moneda es obligatorio")
    private String simboloMoneda;

    @NotBlank(message = "El nombre del impuesto es obligatorio")
    private String impuestoNombre;

    @NotNull(message = "El porcentaje del impuesto es obligatorio")
    @DecimalMin(value = "0.0", message = "El impuesto no puede ser negativo")
    private BigDecimal impuestoPorcentaje;

    private String logoUrl;
}