package com.vantix.pos.modules.reports.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReporteComprasDTO {
    private BigDecimal totalComprado;
    private BigDecimal totalDeudaProveedores;
    private List<DeudaProveedorDTO> rankingDeudas;

    @Data
    @Builder
    public static class DeudaProveedorDTO {
        private String proveedorNombre;
        private String documento;
        private BigDecimal montoAdeudado;
    }
}