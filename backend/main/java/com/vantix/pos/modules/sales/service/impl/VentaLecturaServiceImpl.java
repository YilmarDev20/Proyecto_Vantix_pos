package com.vantix.pos.modules.sales.service.impl;

import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.mapper.VentaMapper;
import com.vantix.pos.modules.sales.repository.VentaRepository;
import com.vantix.pos.modules.sales.service.VentaLecturaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaLecturaServiceImpl implements VentaLecturaService {

    private final VentaRepository ventaRepository;
    private final VentaMapper ventaMapper;

    // ---> CAMBIO: Usamos findByTiendaIdOrderByFechaVentaDesc <---
    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> obtenerHistorial(Integer tiendaId) {
        List<Venta> ventas;

        if (tiendaId == null) {
            // Si no hay tiendaId (Visión Global), traemos todo
            ventas = ventaRepository.findAllByOrderByFechaVentaDesc();
        } else {
            // Si hay tiendaId, filtramos
            ventas = ventaRepository.findByTiendaIdOrderByFechaVentaDesc(tiendaId);
        }

        return ventas.stream()
                .map(ventaMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponseDTO obtenerVentaPorId(Integer id) {
        return ventaRepository.findById(id)
                .map(ventaMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> obtenerHistorialPorCliente(Integer clienteId) {
        return ventaRepository.findByClienteIdOrderByFechaVentaDesc(clienteId).stream()
                .map(ventaMapper::toDto)
                .collect(Collectors.toList());
    }
}