package com.vantix.pos.modules.sales.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORTAMOS EL ESCÁNER DE SEGURIDAD
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.entity.VariantePresentacion;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
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
import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.entity.PagoVenta;
import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.entity.VentaDetalle;
import com.vantix.pos.modules.sales.enums.EstadoPagoVenta;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.mapper.VentaMapper;
import com.vantix.pos.modules.sales.repository.VentaRepository;
import com.vantix.pos.modules.sales.service.VentaRegistroService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaRegistroServiceImpl implements VentaRegistroService {

    private final VentaRepository ventaRepository;
    private final VarianteRepository varianteRepository;
    private final ClienteRepository clienteRepository;
    private final VentaMapper ventaMapper;
    private final KardexService kardexService;
    private final TurnoCajaService turnoCajaService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public VentaResponseDTO procesarVenta(NuevaVentaRequestDTO request) {

        boolean esCotizacion = request.getTipoComprobante().name().equals("COTIZACION");

        if (esCotizacion && request.getClienteId() == null) {
            throw new IllegalArgumentException("No se puede generar una cotización sin asignar un cliente válido.");
        }

        if (!esCotizacion && (request.getPagos() == null || request.getPagos().isEmpty())) {
            throw new IllegalArgumentException("La venta debe tener al menos un método de pago.");
        }

        Cliente cliente = null;
        if (request.getClienteId() != null) {
            cliente = clienteRepository.findById(request.getClienteId()).orElse(null);
        }

        long count = ventaRepository.countByTipoComprobante(request.getTipoComprobante()) + 1;
        String prefijo = request.getTipoComprobante().name().substring(0, 3).toUpperCase();
        String correlativo = String.format("%s-%06d", prefijo, count);

        boolean esVentaCredito = request.getPagos() != null && request.getPagos().stream()
                .anyMatch(p -> p.getMetodoPago().name().equals("CREDITO"));

        LocalDateTime fechaVencimiento = null;
        if (esCotizacion) {
            fechaVencimiento = LocalDateTime.now().plusDays(7);
        }

        BigDecimal saldoPendiente = BigDecimal.ZERO;
        EstadoPagoVenta estadoPago = EstadoPagoVenta.PAGADO;

        if (!esCotizacion) {
            saldoPendiente = request.getTotalFinal().subtract(request.getPagoRecibido() != null ? request.getPagoRecibido() : BigDecimal.ZERO);

            if (saldoPendiente.compareTo(BigDecimal.ZERO) > 0) {
                if (request.getPagoRecibido() == null || request.getPagoRecibido().compareTo(BigDecimal.ZERO) == 0) {
                    estadoPago = EstadoPagoVenta.PENDIENTE;
                } else {
                    estadoPago = EstadoPagoVenta.PARCIAL;
                }
            }
        }

        // ---> AQUÍ ESTÁ LA MAGIA DE LA SEGURIDAD <---
        // Forzamos a que el sistema asigne la venta al usuario que realmente hizo la petición mediante el Token
        Integer usuarioRealId = SecurityUtils.getUsuarioId();
        // Si el request no manda tiendaId (ej. venta rápida), tomamos la tienda donde el usuario está logueado
        Integer tiendaRealId = request.getTiendaId() != null ? request.getTiendaId() : SecurityUtils.getTiendaId();

        Venta venta = Venta.builder()
                .tiendaId(tiendaRealId)
                .usuarioId(usuarioRealId)
                .turnoCajaId(request.getTurnoCajaId())
                .cliente(cliente)
                .tipoComprobante(request.getTipoComprobante())
                .correlativo(correlativo)
                .subtotal(request.getSubtotal())
                .descuentoTotal(request.getDescuentoTotal() != null ? request.getDescuentoTotal() : BigDecimal.ZERO)
                .impuestoTotal(request.getImpuestoTotal() != null ? request.getImpuestoTotal() : BigDecimal.ZERO)
                .totalFinal(request.getTotalFinal())
                .pagoRecibido(request.getPagoRecibido())
                .vuelto(request.getVuelto() != null ? request.getVuelto() : BigDecimal.ZERO)
                .observaciones(request.getObservaciones())
                .estadoVenta(esCotizacion ? EstadoVenta.PENDIENTE_COTIZACION : EstadoVenta.COMPLETADA)
                .estadoPago(estadoPago)
                .saldoPendiente(saldoPendiente)
                .fechaVencimiento(fechaVencimiento)
                .build();

        List<AjusteInventarioDTO> ajustesParaKardex = new ArrayList<>();

        for (NuevaVentaRequestDTO.DetalleVentaReqDTO detDTO : request.getDetalles()) {
            Variante variante = varianteRepository.findById(detDTO.getVarianteId())
                    .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada: " + detDTO.getVarianteId()));

            Producto producto = variante.getProducto();

            int factorDeConversion = 1;
            String sufijoPresentacion = "";
            VariantePresentacion presentacionEncontrada = null;

            if (detDTO.getPresentacionId() != null) {
                presentacionEncontrada = variante.getPresentaciones().stream()
                        .filter(p -> p.getId().equals(detDTO.getPresentacionId()))
                        .findFirst()
                        .orElseThrow(() -> new EntityNotFoundException("Presentación no encontrada: " + detDTO.getPresentacionId()));

                factorDeConversion = presentacionEncontrada.getFactorConversion();
                sufijoPresentacion = " - " + presentacionEncontrada.getNombre();
            }

            String marcaStr = (producto != null && producto.getMarca() != null && !producto.getMarca().isBlank())
                    ? " (" + producto.getMarca() + ")" : "";
            String nombreBase = (producto != null ? producto.getNombre() : "Desconocido") + marcaStr;

            String atributosStr = "";
            if (variante.getAtributos() != null && !variante.getAtributos().isEmpty()) {
                atributosStr = " - " + String.join(" | ", variante.getAtributos().values().stream().map(Object::toString).toList());
            }

            String nombreHistorico = nombreBase + atributosStr + sufijoPresentacion;

            VentaDetalle detalle = VentaDetalle.builder()
                    .variante(variante)
                    .presentacion(presentacionEncontrada)
                    .nombreProductoHistorico(nombreHistorico)
                    .costoUnitarioHistorico(variante.getCostoPromedio() != null ? variante.getCostoPromedio() : variante.getPrecioCompra())
                    .cantidad(detDTO.getCantidad())
                    .factorConversion(factorDeConversion)
                    .precioUnitario(detDTO.getPrecioUnitario())
                    .descuentoUnitario(detDTO.getDescuentoUnitario() != null ? detDTO.getDescuentoUnitario() : BigDecimal.ZERO)
                    .subtotal(detDTO.getSubtotal())
                    .build();

            venta.addDetalle(detalle);

            if (!esCotizacion) {
                AjusteInventarioDTO kardexDTO = new AjusteInventarioDTO();
                kardexDTO.setVarianteId(variante.getId());
                kardexDTO.setTipoMovimiento(TipoMovimiento.SALIDA);

                int cantidadFisicaTotal = detDTO.getCantidad() * factorDeConversion;
                kardexDTO.setCantidad(cantidadFisicaTotal);

                kardexDTO.setNotas("Venta " + correlativo + (sufijoPresentacion.isEmpty() ? "" : " (" + detDTO.getCantidad() + " " + sufijoPresentacion.replace(" - ", "") + ")"));
                ajustesParaKardex.add(kardexDTO);
            }
        }

        if (request.getPagos() != null) {
            for (NuevaVentaRequestDTO.PagoVentaReqDTO pagoDTO : request.getPagos()) {
                PagoVenta pago = PagoVenta.builder()
                        .metodoPago(pagoDTO.getMetodoPago())
                        .montoPagado(pagoDTO.getMontoPagado())
                        .referencia(pagoDTO.getReferencia())
                        .build();
                venta.addPago(pago);

                if (!esCotizacion && !pagoDTO.getMetodoPago().name().equals("CREDITO") && request.getTurnoCajaId() != null) {
                    NuevoMovimientoRequestDTO movDTO = new NuevoMovimientoRequestDTO();
                    movDTO.setUsuarioId(venta.getUsuarioId()); // Como ya se seteó arriba, aquí enviará el correcto
                    movDTO.setTipoMovimiento(TipoMovimientoCaja.INGRESO);
                    movDTO.setMetodoPago(MetodoPago.valueOf(pagoDTO.getMetodoPago().name()));

                    BigDecimal montoRealCaja = pagoDTO.getMontoPagado();
                    if (pagoDTO.getMetodoPago().name().equals("EFECTIVO")) {
                        montoRealCaja = pagoDTO.getMontoPagado().subtract(venta.getVuelto());
                    }

                    movDTO.setMonto(montoRealCaja.compareTo(BigDecimal.ZERO) > 0 ? montoRealCaja : BigDecimal.ZERO);
                    movDTO.setConcepto("Venta en " + pagoDTO.getMetodoPago().name() + ": " + correlativo);

                    turnoCajaService.registrarMovimiento(request.getTurnoCajaId(), movDTO);
                }
            }
        }

        Venta ventaGuardada = ventaRepository.save(venta);

        if (request.getCotizacionOrigenId() != null && !esCotizacion) {
            Venta cotizacionAntigua = ventaRepository.findById(request.getCotizacionOrigenId())
                    .orElseThrow(() -> new EntityNotFoundException("Cotización origen no encontrada"));

            cotizacionAntigua.setEstadoVenta(EstadoVenta.COMPLETADA);
            ventaRepository.save(cotizacionAntigua);
        }

        if (!esCotizacion && !ajustesParaKardex.isEmpty()) {
            AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
            kardexRequest.setOrigen(OrigenMovimiento.VENTA);
            kardexRequest.setTiendaId(venta.getTiendaId());
            kardexRequest.setUsuarioId(venta.getUsuarioId());
            kardexRequest.setAjustes(ajustesParaKardex);
            kardexService.procesarAjusteMasivo(kardexRequest);
        }

        if (cliente != null && !esCotizacion) {
            cliente.setUltimaCompra(LocalDateTime.now());
            cliente.setTotalComprado(cliente.getTotalComprado().add(venta.getTotalFinal()));
            if (esVentaCredito) {
                cliente.setDeudaActual(cliente.getDeudaActual().add(venta.getTotalFinal()));
            }
            clienteRepository.save(cliente);
        }

        VentaResponseDTO responseDTO = ventaMapper.toDto(ventaGuardada);

        String accionAudit = esCotizacion ? "CREAR_COTIZACION" : "REGISTRAR_VENTA";
        String descAudit = (esCotizacion ? "Se generó cotización: " : "Se registró venta: ")
                + correlativo + " por un total de S/ " + ventaGuardada.getTotalFinal();

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(ventaGuardada.getUsuarioId())
                .tiendaId(ventaGuardada.getTiendaId())
                .modulo("VENTAS")
                .accion(accionAudit)
                .entidadId(ventaGuardada.getId())
                .descripcion(descAudit)
                .valorAnterior(null)
                .valorNuevo(responseDTO)
                .direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }
}