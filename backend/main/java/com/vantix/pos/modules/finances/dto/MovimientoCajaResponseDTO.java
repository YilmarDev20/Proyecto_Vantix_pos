package com.vantix.pos.modules.finances.dto;

import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MovimientoCajaResponseDTO {
    private Integer id;
    private TipoMovimientoCaja tipoMovimiento;
    private MetodoPago metodoPago;
    private BigDecimal monto;
    private String concepto;
    private LocalDateTime fechaMovimiento;
    private Integer usuarioId;
}