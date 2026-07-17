package com.vantix.pos.modules.audit.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuditoriaEvent {
    private final Integer usuarioId;
    private final Integer tiendaId;
    private final String modulo;
    private final String accion;
    private final Integer entidadId;
    private final String descripcion;
    private final Object valorAnterior;
    private final Object valorNuevo;
    private final String direccionIp;
}