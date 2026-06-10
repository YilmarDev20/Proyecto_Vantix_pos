package com.vantix.pos.modules.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vantix.pos.modules.audit.entity.AuditoriaLog;
import com.vantix.pos.modules.audit.repository.AuditoriaLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaLogRepository repository;
    private final ObjectMapper objectMapper;

    /**
     * Registra un evento de auditoría.
     * Usamos Propagation.REQUIRES_NEW para que, incluso si la transacción principal falla,
     * el intento (ej. intento de fraude) quede registrado.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarAccion(Integer usuarioId, Integer tiendaId, String modulo, String accion,
                                Integer entidadId, String descripcion,
                                Object valorAnterior, Object valorNuevo, String ip) {
        try {
            AuditoriaLog logAudit = AuditoriaLog.builder()
                    .usuarioId(usuarioId)
                    .tiendaId(tiendaId)
                    .modulo(modulo)
                    .accion(accion)
                    .entidadId(entidadId)
                    .descripcion(descripcion)
                    .valoresAnteriores(convertirAJson(valorAnterior))
                    .valoresNuevos(convertirAJson(valorNuevo))
                    .direccionIp(ip)
                    .build();

            repository.save(logAudit);
        } catch (Exception e) {
            log.error("Error al registrar auditoría: {}", e.getMessage());
        }
    }

    private String convertirAJson(Object objeto) {
        if (objeto == null) return null;
        try {
            return objectMapper.writeValueAsString(objeto);
        } catch (JsonProcessingException e) {
            log.error("Error convirtiendo objeto a JSON para auditoría", e);
            return "{\"error\": \"No se pudo serializar el objeto\"}";
        }
    }
}