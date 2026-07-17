package com.vantix.pos.modules.sales.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ValidacionCotizacionDTO {
    private boolean todoDisponible;
    private Integer clienteId;
    private String clienteNombre;
    private String telefonoCliente;
    private List<ItemValidadoDTO> items;

    @Data
    public static class ItemValidadoDTO {
        private Integer varianteId;
        private Integer productoId;

        // ---> NUEVOS CAMPOS PARA RECUPERAR EL EMPAQUE <---
        private Integer presentacionId;
        private String nombrePresentacion;
        private Integer factorConversion;

        private String sku;
        private String nombreProducto;
        private Map<String, Object> atributos;
        private Integer cantidadSolicitada;
        private Integer stockActual; // Físico
        private BigDecimal precioCotizado;
        private boolean hayStockSuficiente;
    }
}