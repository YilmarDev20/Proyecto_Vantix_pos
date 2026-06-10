package com.vantix.pos.modules.sales.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORTAMOS EL ESCÁNER DE SEGURIDAD
import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.customer.repository.ClienteRepository;
import com.vantix.pos.modules.finances.dto.NuevoMovimientoRequestDTO;
import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.finances.enums.TipoMovimientoCaja;
import com.vantix.pos.modules.finances.service.TurnoCajaService;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteInventarioDTO;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import com.vantix.pos.modules.inventory.kardex.service.KardexService;
import com.vantix.pos.modules.sales.entity.PagoVenta;
import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.entity.VentaDetalle;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.repository.VentaRepository;
import com.vantix.pos.modules.sales.service.AnulacionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnulacionServiceImpl implements AnulacionService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final KardexService kardexService;
    private final TurnoCajaService turnoCajaService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void anularVenta(Integer id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada con ID: " + id));

        if (venta.getEstadoVenta() == EstadoVenta.ANULADA) {
            throw new IllegalStateException("Esta venta ya se encuentra anulada.");
        }

        // 1. Obtenemos quién está anulando la venta AHORA MISMO
        Integer idUsuarioActual = SecurityUtils.getUsuarioId();
        Integer idTiendaActual = SecurityUtils.getTiendaId();

        String estadoAnterior = venta.getEstadoVenta().name();
        venta.setEstadoVenta(EstadoVenta.ANULADA);
        boolean esCotizacion = venta.getTipoComprobante().name().equals("COTIZACION");

        if (!esCotizacion) {
            List<AjusteInventarioDTO> ajustesParaKardex = new ArrayList<>();
            for (VentaDetalle detalle : venta.getDetalles()) {
                AjusteInventarioDTO kardexDTO = new AjusteInventarioDTO();
                kardexDTO.setVarianteId(detalle.getVariante().getId());
                kardexDTO.setTipoMovimiento(TipoMovimiento.ENTRADA);

                int cantidadFisicaARetornar = detalle.getCantidad() * detalle.getFactorConversion();
                kardexDTO.setCantidad(cantidadFisicaARetornar);

                kardexDTO.setNotas("Devolución por Anulación de Venta: " + venta.getCorrelativo());
                ajustesParaKardex.add(kardexDTO);
            }

            AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
            kardexRequest.setOrigen(OrigenMovimiento.DEVOLUCION);
            kardexRequest.setTiendaId(venta.getTiendaId());
            // El kardex registra quién devolvió la mercancía físicamente
            kardexRequest.setUsuarioId(idUsuarioActual);
            kardexRequest.setAjustes(ajustesParaKardex);
            kardexService.procesarAjusteMasivo(kardexRequest);
        }

        boolean eraCredito = false;
        for (PagoVenta pago : venta.getPagos()) {
            if (pago.getMetodoPago().name().equals("CREDITO")) {
                eraCredito = true;
            } else if (!esCotizacion && venta.getTurnoCajaId() != null) {
                NuevoMovimientoRequestDTO movDTO = new NuevoMovimientoRequestDTO();
                // El retiro de caja queda a nombre de quien hizo la anulación
                movDTO.setUsuarioId(idUsuarioActual);
                movDTO.setTipoMovimiento(TipoMovimientoCaja.EGRESO);
                movDTO.setMetodoPago(MetodoPago.valueOf(pago.getMetodoPago().name()));

                BigDecimal montoRealCaja = pago.getMontoPagado();
                if (pago.getMetodoPago().name().equals("EFECTIVO")) {
                    montoRealCaja = pago.getMontoPagado().subtract(venta.getVuelto());
                }

                movDTO.setMonto(montoRealCaja);
                movDTO.setConcepto("Devolución por Anulación: " + venta.getCorrelativo());
                turnoCajaService.registrarMovimiento(venta.getTurnoCajaId(), movDTO);
            }
        }

        Cliente cliente = venta.getCliente();
        if (cliente != null && !esCotizacion) {
            cliente.setTotalComprado(cliente.getTotalComprado().subtract(venta.getTotalFinal()));
            if (eraCredito) {
                cliente.setDeudaActual(cliente.getDeudaActual().subtract(venta.getTotalFinal()));
            }
            clienteRepository.save(cliente);
        }

        ventaRepository.save(venta);

        // ---> PUBLICAMOS EL EVENTO DE AUDITORÍA TOTALMENTE DINÁMICO <---
        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(idUsuarioActual)
                .tiendaId(idTiendaActual)
                .modulo("VENTAS")
                .accion("ANULAR")
                .entidadId(venta.getId())
                .descripcion("Se anuló el documento: " + venta.getCorrelativo() + " por un total de S/ " + venta.getTotalFinal())
                .valorAnterior("Estado anterior: " + estadoAnterior)
                .valorNuevo("Estado nuevo: ANULADA")
                .direccionIp("127.0.0.1") // Esto lo puedes cambiar más adelante si lees la IP del request
                .build());
    }
}