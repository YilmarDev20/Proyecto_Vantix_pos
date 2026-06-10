package com.vantix.pos.modules.reports.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReporteVentasDTO {
    private BigDecimal ventasTotales;
    private BigDecimal costoTotalInventario;
    private BigDecimal utilidadNeta;
    private List<VendedorRankingDTO> rankingVendedores;
    private List<ClienteValorDTO> rankingClientes;
    private List<ClienteValorDTO> listaDeudores;

    @Data
    @Builder
    public static class VendedorRankingDTO {
        private String nombreVendedor;
        private BigDecimal totalVendido;
        private Long cantidadOperaciones;
    }

    @Data
    @Builder
    public static class ClienteValorDTO {
        private Integer id;
        private String documento;
        private String nombre;
        private BigDecimal monto; // Puede ser Total Comprado o Deuda Actual
    }
}