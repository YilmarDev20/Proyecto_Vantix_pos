package com.vantix.pos.modules.audit.event;

import com.vantix.pos.modules.audit.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditoriaListener {

    private final AuditoriaService auditoriaService;

    @EventListener
    public void manejarEventoAuditoria(AuditoriaEvent evento) {
        log.info("Capturando evento de auditoría para el módulo: {} - Acción: {}", evento.getModulo(), evento.getAccion());

        auditoriaService.registrarAccion(
                evento.getUsuarioId(),
                evento.getTiendaId(),
                evento.getModulo(),
                evento.getAccion(),
                evento.getEntidadId(),
                evento.getDescripcion(),
                evento.getValorAnterior(),
                evento.getValorNuevo(),
                evento.getDireccionIp()
        );
    }
}