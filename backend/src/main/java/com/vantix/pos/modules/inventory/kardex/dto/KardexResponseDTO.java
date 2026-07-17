package com.vantix.pos.modules.inventory.kardex.dto;

import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class KardexResponseDTO {
    private Integer id;
    private Integer varianteId;
    private String varianteSku; // Para mostrar rápido en el frontend
    private String varianteNombre;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private Integer stockResultante;
    private OrigenMovimiento origenMovimiento;
    private Boolean esAutogenerado;
    private String notasInternas;
    private LocalDateTime fechaMovimiento;
    private Integer tiendaId;
    private String tiendaNombre; // <--- CIRUGÍA: Agregamos el nombre
}