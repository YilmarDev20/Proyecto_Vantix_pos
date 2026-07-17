package com.vantix.pos.modules.transfers.dto;

import com.vantix.pos.modules.transfers.enums.EstadoTraslado;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrasladoResponseDTO {
    private Integer id;
    private String correlativo;
    private Integer tiendaOrigenId;
    private Integer tiendaDestinoId;
    private Integer usuarioCreadorId;
    private Integer usuarioReceptorId;
    private EstadoTraslado estadoTraslado;
    private String notas;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaRecepcion;
    private List<DetalleTrasladoResponseDTO> detalles;
}