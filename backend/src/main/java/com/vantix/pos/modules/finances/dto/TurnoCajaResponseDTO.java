package com.vantix.pos.modules.finances.dto;

import com.vantix.pos.modules.finances.enums.EstadoTurno;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TurnoCajaResponseDTO {
    private Integer id;
    private Integer tiendaId;
    private Integer usuarioId;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private BigDecimal montoApertura;
    private BigDecimal totalIngresos;
    private BigDecimal totalEgresos;
    private BigDecimal montoCierreDeclarado;
    private BigDecimal montoCierreSistema;
    private BigDecimal diferencia;
    private EstadoTurno estadoTurno;
}