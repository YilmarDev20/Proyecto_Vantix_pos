package com.vantix.pos.modules.customer.abono.service.impl;

import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.customer.abono.dto.AbonoRequestDTO;
import com.vantix.pos.modules.customer.abono.dto.AbonoResponseDTO;
import com.vantix.pos.modules.customer.abono.entity.AbonoCliente;
import com.vantix.pos.modules.customer.abono.entity.AbonoDetalle;
import com.vantix.pos.modules.customer.abono.mapper.AbonoMapper;
import com.vantix.pos.modules.customer.abono.repository.AbonoClienteRepository;
import com.vantix.pos.modules.customer.abono.service.AbonoService;
import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.customer.repository.ClienteRepository;
import com.vantix.pos.modules.finances.dto.NuevoMovimientoRequestDTO;
import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import com.vantix.pos.modules.finances.service.TurnoCajaService;
import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.enums.EstadoPagoVenta;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.repository.VentaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbonoServiceImpl implements AbonoService {

    private final AbonoClienteRepository abonoRepository;
    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final TurnoCajaService turnoCajaService;
    private final AbonoMapper abonoMapper;

    @Override
    @Transactional
    public AbonoResponseDTO registrarAbono(AbonoRequestDTO request) {
        Cliente cliente = clienteRepository.findByIdAndEstadoTrue(request.getClienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado o inactivo."));

        if (request.getMontoTotal().compareTo(cliente.getDeudaActual()) > 0) {
            throw new IllegalArgumentException("El monto a abonar (S/ " + request.getMontoTotal() + ") no puede ser mayor a la deuda actual (S/ " + cliente.getDeudaActual() + ").");
        }

        // ---> EXTRAEMOS EL USUARIO REAL (DESQUEMADO) <---
        Integer usuarioRealId = SecurityUtils.getUsuarioId();

        AbonoCliente abono = AbonoCliente.builder()
                .cliente(cliente)
                .turnoCajaId(request.getTurnoCajaId())
                .usuarioId(usuarioRealId) // ---> DESQUEMADO
                .montoTotal(request.getMontoTotal())
                .metodoPago(request.getMetodoPago())
                .referencia(request.getReferencia())
                .notas(request.getNotas())
                .build();

        List<EstadoPagoVenta> estadosDeuda = Arrays.asList(EstadoPagoVenta.PENDIENTE, EstadoPagoVenta.PARCIAL);
        List<Venta> ticketsPendientes = ventaRepository.findByClienteIdAndEstadoPagoInOrderByFechaVentaAsc(cliente.getId(), estadosDeuda)
                .stream()
                .filter(ticket -> ticket.getEstadoVenta() != EstadoVenta.ANULADA)
                .collect(Collectors.toList());

        BigDecimal montoRestantePorAsignar = request.getMontoTotal();

        for (Venta ticket : ticketsPendientes) {
            if (montoRestantePorAsignar.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal deudaDelTicket = ticket.getSaldoPendiente();
            BigDecimal montoAInyectarEnEsteTicket;

            if (montoRestantePorAsignar.compareTo(deudaDelTicket) >= 0) {
                montoAInyectarEnEsteTicket = deudaDelTicket;
                ticket.setSaldoPendiente(BigDecimal.ZERO);
                ticket.setEstadoPago(EstadoPagoVenta.PAGADO);
            } else {
                montoAInyectarEnEsteTicket = montoRestantePorAsignar;
                ticket.setSaldoPendiente(deudaDelTicket.subtract(montoRestantePorAsignar));
                ticket.setEstadoPago(EstadoPagoVenta.PARCIAL);
            }

            montoRestantePorAsignar = montoRestantePorAsignar.subtract(montoAInyectarEnEsteTicket);

            AbonoDetalle detalle = AbonoDetalle.builder()
                    .venta(ticket)
                    .montoAsignado(montoAInyectarEnEsteTicket)
                    .build();
            abono.addDetalle(detalle);

            ventaRepository.save(ticket);
        }

        cliente.setDeudaActual(cliente.getDeudaActual().subtract(request.getMontoTotal()));
        clienteRepository.save(cliente);

        NuevoMovimientoRequestDTO movDTO = new NuevoMovimientoRequestDTO();
        movDTO.setUsuarioId(abono.getUsuarioId()); // Como ya se seteó arriba, aquí enviará el correcto
        movDTO.setTipoMovimiento(TipoMovimientoCaja.INGRESO);
        movDTO.setMetodoPago(MetodoPago.valueOf(request.getMetodoPago().name()));
        movDTO.setMonto(request.getMontoTotal());
        movDTO.setConcepto("Abono de Deuda - Cliente: " + cliente.getNombreCompleto());
        turnoCajaService.registrarMovimiento(request.getTurnoCajaId(), movDTO);

        return abonoMapper.toDto(abonoRepository.save(abono));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AbonoResponseDTO> obtenerHistorialPorCliente(Integer clienteId) {
        return abonoRepository.findByClienteIdOrderByFechaAbonoDesc(clienteId)
                .stream().map(abonoMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void anularAbono(Integer abonoId) {
        AbonoCliente abono = abonoRepository.findById(abonoId)
                .orElseThrow(() -> new EntityNotFoundException("Abono no encontrado"));

        if (!abono.getEstado()) {
            throw new IllegalStateException("El abono ya se encuentra anulado.");
        }

        for (AbonoDetalle detalle : abono.getDetalles()) {
            Venta ticket = detalle.getVenta();
            BigDecimal nuevoSaldoPendiente = ticket.getSaldoPendiente().add(detalle.getMontoAsignado());

            ticket.setSaldoPendiente(nuevoSaldoPendiente);
            if (nuevoSaldoPendiente.compareTo(ticket.getTotalFinal()) >= 0) {
                ticket.setEstadoPago(EstadoPagoVenta.PENDIENTE);
            } else {
                ticket.setEstadoPago(EstadoPagoVenta.PARCIAL);
            }
            ventaRepository.save(ticket);
        }

        Cliente cliente = abono.getCliente();
        cliente.setDeudaActual(cliente.getDeudaActual().add(abono.getMontoTotal()));
        clienteRepository.save(cliente);

        NuevoMovimientoRequestDTO movDTO = new NuevoMovimientoRequestDTO();
        movDTO.setUsuarioId(SecurityUtils.getUsuarioId()); // ---> DESQUEMADO: Toma a quien está anulando AHORA
        movDTO.setTipoMovimiento(TipoMovimientoCaja.EGRESO);
        movDTO.setMetodoPago(MetodoPago.valueOf(abono.getMetodoPago().name()));
        movDTO.setMonto(abono.getMontoTotal());
        movDTO.setConcepto("Anulación de Abono - Cliente: " + cliente.getNombreCompleto());
        turnoCajaService.registrarMovimiento(abono.getTurnoCajaId(), movDTO);

        abono.setEstado(false);
        abonoRepository.save(abono);
    }
}