package com.vantix.pos.publico.order.service.impl;

import com.vantix.pos.modules.finances.enums.MetodoPago;
import com.vantix.pos.modules.sales.dto.NuevaVentaRequestDTO;
import com.vantix.pos.modules.sales.enums.MetodoPagoVenta;
import com.vantix.pos.modules.sales.enums.TipoComprobante;
import com.vantix.pos.modules.sales.service.VentaRegistroService;
import com.vantix.pos.publico.order.dto.CrearPedidoWebDTO;
import com.vantix.pos.publico.order.dto.PedidoWebResponseDTO;
import com.vantix.pos.publico.order.model.PedidoWeb;
import com.vantix.pos.publico.order.model.PedidoWebDetalle;
import com.vantix.pos.publico.order.repository.PedidoWebRepository;
import com.vantix.pos.publico.order.service.PedidoWebService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoWebServiceImpl implements PedidoWebService {

    private final PedidoWebRepository pedidoWebRepository;
    private final VentaRegistroService ventaRegistroService;

    private final String UPLOAD_DIR = "uploads/comprobantes/";

    @Override
    @Transactional
    public PedidoWebResponseDTO crearPedido(CrearPedidoWebDTO dto, MultipartFile comprobante) {
        String codigoGenerado = "ZAR-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String comprobanteUrl = null;
        if (comprobante != null && !comprobante.isEmpty()) {
            comprobanteUrl = guardarComprobante(comprobante, codigoGenerado);
        }

        PedidoWeb pedido = PedidoWeb.builder()
                .codigoPedido(codigoGenerado)
                .clienteNombre(dto.getClienteNombre())
                .clienteTelefono(dto.getClienteTelefono())
                .tiendaId(dto.getTiendaId())
                .tipoEntrega("RECOJO_TIENDA")
                .metodoPago(dto.getMetodoPago())
                .comprobanteUrl(comprobanteUrl)
                .montoTotal(dto.getMontoTotal())
                .estado(PedidoWeb.EstadoPedidoWeb.PENDIENTE)
                .build();

        if (dto.getItems() != null) {
            for (CrearPedidoWebDTO.ItemPedidoDTO itemDto : dto.getItems()) {
                PedidoWebDetalle detalle = PedidoWebDetalle.builder()
                        .pedidoWeb(pedido)
                        .varianteId(itemDto.getVarianteId())
                        .presentacionId(itemDto.getPresentacionId())
                        .productoNombre(itemDto.getProductoNombre())
                        .cantidad(itemDto.getCantidad())
                        .precioUnitario(itemDto.getPrecioUnitario())
                        .subtotal(itemDto.getSubtotal())
                        .build();
                pedido.getDetalles().add(detalle);
            }
        }

        PedidoWeb guardado = pedidoWebRepository.save(pedido);
        return mapearAResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoWebResponseDTO obtenerPorCodigo(String codigoPedido) {
        PedidoWeb pedido = pedidoWebRepository.findByCodigoPedido(codigoPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con código: " + codigoPedido));
        return mapearAResponse(pedido);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoWebResponseDTO> listarPedidosAdmin(Integer tiendaId, PedidoWeb.EstadoPedidoWeb estado) {
        List<PedidoWeb> pedidos;
        if (tiendaId != null && estado != null) {
            pedidos = pedidoWebRepository.findByTiendaIdAndEstadoOrderByFechaCreacionDesc(tiendaId, estado);
        } else if (tiendaId != null) {
            pedidos = pedidoWebRepository.findByTiendaIdOrderByFechaCreacionDesc(tiendaId);
        } else if (estado != null) {
            pedidos = pedidoWebRepository.findByEstadoOrderByFechaCreacionDesc(estado);
        } else {
            pedidos = pedidoWebRepository.findAllByOrderByFechaCreacionDesc();
        }
        return pedidos.stream().map(this::mapearAResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PedidoWebResponseDTO obtenerPorId(Long id) {
        PedidoWeb pedido = pedidoWebRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido web no encontrado con ID: " + id));
        return mapearAResponse(pedido);
    }

    @Override
    @Transactional
    public PedidoWebResponseDTO aprobarPedido(Long id) {
        PedidoWeb pedido = pedidoWebRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));

        if (pedido.getEstado() != PedidoWeb.EstadoPedidoWeb.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden aprobar pedidos en estado PENDIENTE.");
        }

        NuevaVentaRequestDTO ventaRequest = new NuevaVentaRequestDTO();
        ventaRequest.setTiendaId(pedido.getTiendaId());
        ventaRequest.setTipoComprobante(TipoComprobante.TICKET);
        ventaRequest.setSubtotal(pedido.getMontoTotal());
        ventaRequest.setTotalFinal(pedido.getMontoTotal());
        ventaRequest.setPagoRecibido(pedido.getMontoTotal());
        ventaRequest.setVuelto(java.math.BigDecimal.ZERO);
        ventaRequest.setObservaciones("Pedido Web N° " + pedido.getCodigoPedido() + " - Cliente: " + pedido.getClienteNombre());

        List<NuevaVentaRequestDTO.DetalleVentaReqDTO> detallesReq = new ArrayList<>();
        for (PedidoWebDetalle det : pedido.getDetalles()) {
            NuevaVentaRequestDTO.DetalleVentaReqDTO dReq = new NuevaVentaRequestDTO.DetalleVentaReqDTO();
            dReq.setVarianteId(det.getVarianteId());
            dReq.setPresentacionId(det.getPresentacionId());
            dReq.setCantidad(det.getCantidad());
            dReq.setPrecioUnitario(det.getPrecioUnitario());
            dReq.setSubtotal(det.getSubtotal());
            detallesReq.add(dReq);
        }
        ventaRequest.setDetalles(detallesReq);

        List<NuevaVentaRequestDTO.PagoVentaReqDTO> pagosReq = new ArrayList<>();
        NuevaVentaRequestDTO.PagoVentaReqDTO pagoReq = new NuevaVentaRequestDTO.PagoVentaReqDTO();

        MetodoPagoVenta metodoPagoEnum = MetodoPagoVenta.EFECTIVO;
        if ("YAPE".equalsIgnoreCase(pedido.getMetodoPago())) {
            metodoPagoEnum = MetodoPagoVenta.YAPE;
        } else if ("PLIN".equalsIgnoreCase(pedido.getMetodoPago())) {
            metodoPagoEnum = MetodoPagoVenta.PLIN;
        }

        pagoReq.setMetodoPago(metodoPagoEnum);
        pagoReq.setMontoPagado(pedido.getMontoTotal());
        pagoReq.setReferencia("Web: " + pedido.getCodigoPedido());
        pagosReq.add(pagoReq);
        ventaRequest.setPagos(pagosReq);

        ventaRegistroService.procesarVenta(ventaRequest);

        pedido.setEstado(PedidoWeb.EstadoPedidoWeb.CONFIRMADO);
        return mapearAResponse(pedidoWebRepository.save(pedido));
    }

    @Override
    @Transactional
    public PedidoWebResponseDTO cancelarPedido(Long id, String motivo) {
        PedidoWeb pedido = pedidoWebRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));

        if (pedido.getEstado() == PedidoWeb.EstadoPedidoWeb.ENTREGADO ||
                pedido.getEstado() == PedidoWeb.EstadoPedidoWeb.CANCELADO) {
            throw new IllegalStateException("No se puede cancelar un pedido en estado " + pedido.getEstado());
        }

        pedido.setEstado(PedidoWeb.EstadoPedidoWeb.CANCELADO);
        return mapearAResponse(pedidoWebRepository.save(pedido));
    }

    private String guardarComprobante(MultipartFile file, String codigoPedido) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String extension = getFileExtension(file.getOriginalFilename());
            String nombreArchivo = codigoPedido + "_" + System.currentTimeMillis() + extension;
            Path path = Paths.get(UPLOAD_DIR + nombreArchivo);
            Files.write(path, file.getBytes());
            return "/uploads/comprobantes/" + nombreArchivo;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el comprobante de pago", e);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return ".jpg";
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private PedidoWebResponseDTO mapearAResponse(PedidoWeb entity) {
        return PedidoWebResponseDTO.builder()
                .id(entity.getId())
                .codigoPedido(entity.getCodigoPedido())
                .clienteNombre(entity.getClienteNombre())
                .clienteTelefono(entity.getClienteTelefono())
                .tiendaId(entity.getTiendaId())
                .tipoEntrega(entity.getTipoEntrega())
                .metodoPago(entity.getMetodoPago())
                .comprobanteUrl(entity.getComprobanteUrl())
                .montoTotal(entity.getMontoTotal())
                .estado(entity.getEstado().name())
                .fechaCreacion(entity.getFechaCreacion())
                .detalles(entity.getDetalles().stream().map(d ->
                        PedidoWebResponseDTO.ItemPedidoResponseDTO.builder()
                                .id(d.getId())
                                .varianteId(d.getVarianteId())
                                .presentacionId(d.getPresentacionId())
                                .productoNombre(d.getProductoNombre())
                                .cantidad(d.getCantidad())
                                .precioUnitario(d.getPrecioUnitario())
                                .subtotal(d.getSubtotal())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}