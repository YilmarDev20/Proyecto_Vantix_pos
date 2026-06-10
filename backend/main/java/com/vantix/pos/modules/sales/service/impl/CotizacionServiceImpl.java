package com.vantix.pos.modules.sales.service.impl;

import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.entity.VariantePresentacion;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.customer.repository.ClienteRepository;
import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.dto.ValidacionCotizacionDTO;
import com.vantix.pos.modules.sales.dto.VentaResponseDTO;
import com.vantix.pos.modules.sales.entity.Venta;
import com.vantix.pos.modules.sales.entity.VentaDetalle;
import com.vantix.pos.modules.sales.enums.EstadoVenta;
import com.vantix.pos.modules.sales.enums.TipoComprobante;
import com.vantix.pos.modules.sales.mapper.VentaMapper;
import com.vantix.pos.modules.sales.repository.VentaRepository;
import com.vantix.pos.modules.sales.service.CotizacionService;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CotizacionServiceImpl implements CotizacionService {

    private final VentaRepository ventaRepository;
    private final VarianteRepository varianteRepository;
    private final ClienteRepository clienteRepository;
    private final VentaMapper ventaMapper;
    private final InventarioTiendaRepository inventarioTiendaRepository;

    @Override
    @Transactional(readOnly = true)
    public ValidacionCotizacionDTO validarStockCotizacion(Integer cotizacionId, Integer tiendaId) {
        Venta cotizacion = ventaRepository.findById(cotizacionId)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

        if (cotizacion.getTipoComprobante() != TipoComprobante.COTIZACION) {
            throw new IllegalStateException("El documento no es una cotización");
        }
        if (cotizacion.getEstadoVenta() != EstadoVenta.PENDIENTE_COTIZACION) {
            throw new IllegalStateException("Esta cotización ya fue cobrada o anulada");
        }
        if (cotizacion.getFechaVencimiento() != null && cotizacion.getFechaVencimiento().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Esta cotización ha vencido");
        }

        ValidacionCotizacionDTO respuesta = new ValidacionCotizacionDTO();
        respuesta.setTodoDisponible(true);
        if (cotizacion.getCliente() != null) {
            respuesta.setClienteId(cotizacion.getCliente().getId());
            respuesta.setClienteNombre(cotizacion.getCliente().getNombreCompleto());
            respuesta.setTelefonoCliente(cotizacion.getCliente().getTelefono());
        }

        List<ValidacionCotizacionDTO.ItemValidadoDTO> itemsValidados = new ArrayList<>();
        for (VentaDetalle detalle : cotizacion.getDetalles()) {
            Variante variante = detalle.getVariante();
            ValidacionCotizacionDTO.ItemValidadoDTO item = new ValidacionCotizacionDTO.ItemValidadoDTO();
            item.setVarianteId(variante.getId());

            if (variante.getProducto() != null) {
                item.setProductoId(variante.getProducto().getId());
            }
            item.setAtributos(variante.getAtributos());
            item.setSku(variante.getSku());
            item.setNombreProducto(detalle.getNombreProductoHistorico());

            if (detalle.getPresentacion() != null) {
                item.setPresentacionId(detalle.getPresentacion().getId());
                item.setNombrePresentacion(detalle.getPresentacion().getNombre());
                item.setFactorConversion(detalle.getPresentacion().getFactorConversion());
            } else {
                item.setFactorConversion(1);
            }

            item.setCantidadSolicitada(detalle.getCantidad());
            item.setPrecioCotizado(detalle.getPrecioUnitario());

            int factor = item.getFactorConversion() != null ? item.getFactorConversion() : 1;
            int cantidadNecesariaFisica = detalle.getCantidad() * factor;

            Integer stockReal = inventarioTiendaRepository.findByVarianteIdAndTiendaId(variante.getId(), tiendaId)
                    .map(InventarioTienda::getStockActual)
                    .orElse(0);

            item.setStockActual(stockReal);

            if (stockReal >= cantidadNecesariaFisica) {
                item.setHayStockSuficiente(true);
            } else {
                item.setHayStockSuficiente(false);
                respuesta.setTodoDisponible(false);
            }
            itemsValidados.add(item);
        }
        respuesta.setItems(itemsValidados);
        return respuesta;
    }

    @Override
    @Transactional
    public VentaResponseDTO actualizarCotizacion(Integer id, NuevaVentaRequestDTO request) {
        Venta cotizacion = ventaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cotización no encontrada"));

        if (cotizacion.getEstadoVenta() != EstadoVenta.PENDIENTE_COTIZACION) {
            throw new IllegalStateException("Solo se pueden editar cotizaciones pendientes.");
        }

        if (request.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado"));
            cotizacion.setCliente(cliente);
        }

        cotizacion.setSubtotal(request.getSubtotal());
        cotizacion.setDescuentoTotal(request.getDescuentoTotal() != null ? request.getDescuentoTotal() : BigDecimal.ZERO);
        cotizacion.setTotalFinal(request.getTotalFinal());
        cotizacion.setFechaVencimiento(LocalDateTime.now().plusDays(7));

        cotizacion.getDetalles().clear();

        for (NuevaVentaRequestDTO.DetalleVentaReqDTO detDTO : request.getDetalles()) {
            Variante variante = varianteRepository.findById(detDTO.getVarianteId())
                    .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada"));

            Producto producto = variante.getProducto();

            int factorDeConversion = 1;
            VariantePresentacion presentacionEncontrada = null;

            if (detDTO.getPresentacionId() != null) {
                presentacionEncontrada = variante.getPresentaciones().stream()
                        .filter(p -> p.getId().equals(detDTO.getPresentacionId()))
                        .findFirst()
                        .orElseThrow(() -> new EntityNotFoundException("Presentación no encontrada: " + detDTO.getPresentacionId()));

                factorDeConversion = presentacionEncontrada.getFactorConversion();
            }

            // ---> LÓGICA DE NOMBRE HISTÓRICO PERFECTA (SIN SKU Y CON MARCA) <---
            String nombreBase = producto != null ? producto.getNombre() : "Desconocido";

            String marcaStr = (producto != null && producto.getMarca() != null && !producto.getMarca().trim().isEmpty())
                    ? " (" + producto.getMarca() + ")"
                    : "";

            String atributosStr = "";
            if (variante.getAtributos() != null && !variante.getAtributos().isEmpty()) {
                atributosStr = " - " + String.join(", ", variante.getAtributos().values().stream().map(Object::toString).toList());
            }

            String empaqueStr = "";
            if (presentacionEncontrada != null) {
                empaqueStr = " | " + presentacionEncontrada.getNombre();
            }

            // Resultado: "Cuaderno (Loro) - Cuadriculado | Caja"
            String nombreHistorico = nombreBase + marcaStr + atributosStr + empaqueStr;

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

            cotizacion.addDetalle(detalle);
        }

        Venta cotizacionActualizada = ventaRepository.save(cotizacion);
        return ventaMapper.toDto(cotizacionActualizada);
    }
}