package com.vantix.pos.modules.audit.controller;

import com.vantix.pos.modules.audit.dto.AuditoriaLogDTO;
import com.vantix.pos.modules.audit.mapper.AuditoriaMapper;
import com.vantix.pos.modules.audit.repository.AuditoriaLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auditoria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajusta esto a la URL de tu React en producción
public class AuditoriaController {

    private final AuditoriaLogRepository auditoriaLogRepository;
    private final AuditoriaMapper auditoriaMapper;

    @GetMapping("/tienda/{tiendaId}")
    public ResponseEntity<List<AuditoriaLogDTO>> obtenerLogsPorTienda(@PathVariable Integer tiendaId) {
        List<AuditoriaLogDTO> logs = auditoriaLogRepository.findByTiendaIdOrderByFechaRegistroDesc(tiendaId)
                .stream()
                .map(auditoriaMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/modulo/{modulo}")
    public ResponseEntity<List<AuditoriaLogDTO>> obtenerLogsPorModulo(@PathVariable String modulo) {
        List<AuditoriaLogDTO> logs = auditoriaLogRepository.findByModuloOrderByFechaRegistroDesc(modulo)
                .stream()
                .map(auditoriaMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AuditoriaLogDTO>> obtenerLogsPorUsuario(@PathVariable Integer usuarioId) {
        List<AuditoriaLogDTO> logs = auditoriaLogRepository.findByUsuarioIdOrderByFechaRegistroDesc(usuarioId)
                .stream()
                .map(auditoriaMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    // Endpoint para obtener todos (útil para el Admin global)
    @GetMapping
    public ResponseEntity<List<AuditoriaLogDTO>> obtenerTodosLosLogs() {
        // En un sistema real masivo, esto debería llevar paginación (Pageable)
        // Por ahora listamos los últimos movimientos
        List<AuditoriaLogDTO> logs = auditoriaLogRepository.findAll().stream()
                // Idealmente deberías agregar un método findAllByOrderByFechaRegistroDesc en el Repo
                .map(auditoriaMapper::toDto)
                .collect(Collectors.toList());

        // Ordenamos descendentemente en memoria temporalmente
        logs.sort((a, b) -> b.getFechaRegistro().compareTo(a.getFechaRegistro()));

        return ResponseEntity.ok(logs);
    }
}