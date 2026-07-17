package com.vantix.pos.modules.reports.purchases.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReporteComprasDTO {
    private BigDecimal totalComprado;
    private BigDecimal totalDeudaProveedores;
    private List<DeudaProveedorDTO> rankingDeudas;
    private List<InversionCategoriaDTO> inversionPorCategoria;
    private List<InversionTiendaDTO> inversionPorTienda;

    // ---> NUEVA LISTA PARA LA TABLA <---
    private List<HistorialCompraDTO> historialCompras;

    @Data
    @Builder
    public static class HistorialCompraDTO {
        private LocalDateTime fecha;
        private String comprobante;
        private String proveedor;
        private String metodoPago;
        private String estado;
        private BigDecimal total;
    }

    // ... (Mantén los otros Sub-DTOs que ya tenías) ...
    @Data @Builder public static class DeudaProveedorDTO { private String proveedorNombre; private String documento; private BigDecimal montoAdeudado; }
    @Data @Builder public static class InversionCategoriaDTO { private String categoria; private BigDecimal total; }
    @Data @Builder public static class InversionTiendaDTO { private Integer tiendaId; private BigDecimal total; }
}