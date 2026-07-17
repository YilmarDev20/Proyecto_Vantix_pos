package com.vantix.pos.modules.purchases.transaction.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils; // ---> IMPORT DE SEGURIDAD
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteInventarioDTO;
import com.vantix.pos.modules.inventory.kardex.dto.AjusteMasivoRequestDTO;
import com.vantix.pos.modules.inventory.kardex.enums.OrigenMovimiento;
import com.vantix.pos.modules.inventory.kardex.enums.TipoMovimiento;
import com.vantix.pos.modules.inventory.kardex.service.KardexService;
import com.vantix.pos.modules.purchases.supplier.entity.Proveedor;
import com.vantix.pos.modules.purchases.supplier.repository.ProveedorRepository;
import com.vantix.pos.modules.purchases.transaction.dto.CompraResponseDTO;
import com.vantix.pos.modules.purchases.transaction.dto.DetalleCompraDTO;
import com.vantix.pos.modules.purchases.transaction.dto.NuevaCompraRequestDTO;
import com.vantix.pos.modules.purchases.transaction.entity.Compra;
import com.vantix.pos.modules.purchases.transaction.entity.CompraDetalle;
import com.vantix.pos.modules.purchases.transaction.enums.EstadoCompra;
import com.vantix.pos.modules.purchases.transaction.enums.MetodoPago;
import com.vantix.pos.modules.purchases.transaction.mapper.CompraMapper;
import com.vantix.pos.modules.purchases.transaction.repository.CompraRepository;
import com.vantix.pos.modules.purchases.transaction.service.CompraService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final VarianteRepository varianteRepository;
    private final KardexService kardexService;
    private final CompraMapper compraMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public CompraResponseDTO registrarCompra(NuevaCompraRequestDTO request) {
        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));

        boolean esCredito = request.getMetodoPago() == MetodoPago.CREDITO;

        Compra compra = Compra.builder()
                .proveedor(proveedor)
                .tiendaId(request.getTiendaId() != null ? request.getTiendaId() : SecurityUtils.getTiendaId()) // ---> DESQUEMADO
                .usuarioId(SecurityUtils.getUsuarioId()) // ---> DESQUEMADO
                .numeroComprobante(request.getNumeroComprobante())
                .fechaCompra(LocalDateTime.now())
                .metodoPago(request.getMetodoPago())
                .estadoCompra(esCredito ? EstadoCompra.POR_PAGAR : EstadoCompra.PAGADO)
                .total(request.getTotal())
                .saldoPendiente(esCredito ? request.getTotal() : BigDecimal.ZERO)
                .build();

        List<AjusteInventarioDTO> ajustesParaKardex = new ArrayList<>();

        for (DetalleCompraDTO detDTO : request.getDetalles()) {
            Variante variante = varianteRepository.findById(detDTO.getVarianteId())
                    .orElseThrow(() -> new EntityNotFoundException("Variante no encontrada"));

            variante.setPrecioCompra(detDTO.getPrecioUnitario());
            varianteRepository.save(variante);

            BigDecimal subtotalDetalle = detDTO.getPrecioUnitario().multiply(new BigDecimal(detDTO.getCantidad()));
            CompraDetalle detalle = CompraDetalle.builder()
                    .variante(variante)
                    .cantidad(detDTO.getCantidad())
                    .precioUnitario(detDTO.getPrecioUnitario())
                    .subtotal(subtotalDetalle)
                    .build();

            compra.addDetalle(detalle);

            AjusteInventarioDTO ajusteKardex = new AjusteInventarioDTO();
            ajusteKardex.setVarianteId(variante.getId());
            ajusteKardex.setTipoMovimiento(TipoMovimiento.ENTRADA);
            ajusteKardex.setCantidad(detDTO.getCantidad());
            ajusteKardex.setNotas("Compra N° " + request.getNumeroComprobante());
            ajustesParaKardex.add(ajusteKardex);
        }

        Compra compraGuardada = compraRepository.save(compra);
        CompraResponseDTO responseDTO = compraMapper.toDto(compraGuardada);

        AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
        kardexRequest.setOrigen(OrigenMovimiento.COMPRA);
        kardexRequest.setTiendaId(compra.getTiendaId());
        kardexRequest.setUsuarioId(compra.getUsuarioId());
        kardexRequest.setAjustes(ajustesParaKardex);

        kardexService.procesarAjusteMasivo(kardexRequest);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(compraGuardada.getUsuarioId())
                .tiendaId(compraGuardada.getTiendaId())
                .modulo("COMPRAS")
                .accion("REGISTRAR")
                .entidadId(compraGuardada.getId())
                .descripcion("Se registró compra N° " + request.getNumeroComprobante() + " al proveedor " + proveedor.getRazonSocial() + " por S/ " + request.getTotal())
                .valorAnterior(null)
                .valorNuevo(responseDTO)
                .direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarCompras(Integer tiendaId) {
        return compraRepository.findByTiendaIdOrderByFechaRegistroDesc(tiendaId)
                .stream().map(compraMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarCuentasPorPagar(Integer tiendaId) {
        return compraRepository.findByTiendaIdAndEstadoCompraOrderByFechaCompraAsc(tiendaId, EstadoCompra.POR_PAGAR)
                .stream().map(compraMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void anularCompra(Integer id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra no encontrada"));

        if (compra.getEstadoCompra() == EstadoCompra.ANULADO) {
            throw new IllegalStateException("Esta compra ya se encuentra anulada.");
        }

        String estadoAnterior = compra.getEstadoCompra().name();
        compra.setEstadoCompra(EstadoCompra.ANULADO);
        compra.setSaldoPendiente(BigDecimal.ZERO);

        List<AjusteInventarioDTO> ajustesParaKardex = new ArrayList<>();
        for (CompraDetalle detalle : compra.getDetalles()) {
            AjusteInventarioDTO ajusteKardex = new AjusteInventarioDTO();
            ajusteKardex.setVarianteId(detalle.getVariante().getId());
            ajusteKardex.setTipoMovimiento(TipoMovimiento.SALIDA);
            ajusteKardex.setCantidad(detalle.getCantidad());
            ajusteKardex.setNotas("Reversión por anulación de Compra N° " + compra.getNumeroComprobante());
            ajustesParaKardex.add(ajusteKardex);
        }

        AjusteMasivoRequestDTO kardexRequest = new AjusteMasivoRequestDTO();
        kardexRequest.setOrigen(OrigenMovimiento.COMPRA);
        kardexRequest.setTiendaId(compra.getTiendaId());
        kardexRequest.setUsuarioId(SecurityUtils.getUsuarioId()); // ---> DESQUEMADO (Quien anula devuelve el stock)
        kardexRequest.setAjustes(ajustesParaKardex);

        kardexService.procesarAjusteMasivo(kardexRequest);
        compraRepository.save(compra);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()) // ---> DESQUEMADO (Auditoría de quien anula)
                .tiendaId(compra.getTiendaId())
                .modulo("COMPRAS")
                .accion("ANULAR")
                .entidadId(compra.getId())
                .descripcion("Se anuló la compra N° " + compra.getNumeroComprobante() + " por S/ " + compra.getTotal())
                .valorAnterior("Estado anterior: " + estadoAnterior)
                .valorNuevo("Estado nuevo: ANULADO")
                .direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public void pagarDeuda(Integer id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra no encontrada"));

        if (compra.getEstadoCompra() != EstadoCompra.POR_PAGAR) {
            throw new IllegalStateException("Esta compra no está pendiente de pago.");
        }

        BigDecimal deudaPagada = compra.getSaldoPendiente();
        compra.setEstadoCompra(EstadoCompra.PAGADO);
        compra.setSaldoPendiente(BigDecimal.ZERO);
        compraRepository.save(compra);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()) // ---> DESQUEMADO
                .tiendaId(compra.getTiendaId())
                .modulo("COMPRAS")
                .accion("PAGAR_DEUDA")
                .entidadId(compra.getId())
                .descripcion("Se liquidó la deuda de S/ " + deudaPagada + " de la compra N° " + compra.getNumeroComprobante())
                .valorAnterior("Estado anterior: POR_PAGAR | Saldo: " + deudaPagada)
                .valorNuevo("Estado nuevo: PAGADO | Saldo: 0")
                .direccionIp("127.0.0.1")
                .build());
    }
}