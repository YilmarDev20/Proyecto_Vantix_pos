package com.vantix.pos.modules.audit.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditoriaLogDTO {
    private Integer id;
    private Integer usuarioId;
    private Integer tiendaId;
    private String modulo;
    private String accion;
    private Integer entidadId;
    private String descripcion;
    private String valoresAnteriores; // Llega como JSON String
    private String valoresNuevos;     // Llega como JSON String
    private String direccionIp;
    private LocalDateTime fechaRegistro;
}