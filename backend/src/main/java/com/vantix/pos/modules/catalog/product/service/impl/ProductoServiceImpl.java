package com.vantix.pos.modules.catalog.product.service.impl;

import com.vantix.pos.modules.audit.event.AuditoriaEvent;
import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.product.dto.ProductoRequestDTO;
import com.vantix.pos.modules.catalog.product.dto.ProductoResponseDTO;
import com.vantix.pos.modules.catalog.product.entity.PackSurtido;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.enums.UnidadMedida;
import com.vantix.pos.modules.catalog.product.mapper.ProductoMapper;
import com.vantix.pos.modules.catalog.product.repository.ProductoRepository;
import com.vantix.pos.modules.catalog.product.service.ProductoService;
import com.vantix.pos.modules.category.entity.Categoria;
import com.vantix.pos.modules.category.repository.CategoriaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> obtenerTodos() {
        return productoRepository.findAll().stream()
                .map(productoMapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorId(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));
        return productoMapper.toDto(producto);
    }

    @Override
    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO requestDTO) {
        Producto producto = productoMapper.toEntity(requestDTO);
        producto.setEstado(true);
        if (producto.getUnidadMedida() == null) producto.setUnidadMedida(UnidadMedida.NIU);

        // 🚀 LÓGICA E-COMMERCE: Asigna true por defecto si viene nulo
        if (requestDTO.getPublicadoEnWeb() != null) {
            producto.setPublicadoEnWeb(requestDTO.getPublicadoEnWeb());
        } else {
            producto.setPublicadoEnWeb(true);
        }

        asignarCategoria(producto, requestDTO.getCategoriaId());

        if (producto.getPacksSurtidos() != null) {
            producto.getPacksSurtidos().forEach(pack -> {
                pack.setProducto(producto);
                pack.setEstado(true);
            });
        }

        Producto productoGuardado = productoRepository.save(producto);
        ProductoResponseDTO responseDTO = productoMapper.toDto(productoGuardado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_PRODUCTO").accion("CREAR")
                .entidadId(productoGuardado.getId())
                .descripcion("Se creó el producto base: " + productoGuardado.getNombre())
                .valorAnterior(null).valorNuevo(responseDTO).direccionIp("127.0.0.1")
                .build());

        return responseDTO;
    }

    @Override
    @Transactional
    public ProductoResponseDTO actualizar(Integer id, ProductoRequestDTO requestDTO) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));

        ProductoResponseDTO fotoAnterior = productoMapper.toDto(producto);

        productoMapper.updateEntityFromDto(requestDTO, producto);

        // 🚀 LÓGICA E-COMMERCE: Actualiza el estado maestro de visibilidad web
        if (requestDTO.getPublicadoEnWeb() != null) {
            producto.setPublicadoEnWeb(requestDTO.getPublicadoEnWeb());
        }

        asignarCategoria(producto, requestDTO.getCategoriaId());

        if (producto.getPacksSurtidos() != null) {
            producto.getPacksSurtidos().clear();
        }

        if (requestDTO.getPacksSurtidos() != null) {
            requestDTO.getPacksSurtidos().forEach(dto -> {
                PackSurtido nuevoPack = productoMapper.toPackEntity(dto);
                nuevoPack.setProducto(producto);
                nuevoPack.setEstado(true);
                producto.getPacksSurtidos().add(nuevoPack);
            });
        }

        Producto productoActualizado = productoRepository.save(producto);
        ProductoResponseDTO fotoNueva = productoMapper.toDto(productoActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_PRODUCTO").accion("ACTUALIZAR")
                .entidadId(productoActualizado.getId())
                .descripcion("Se actualizó la información del producto base: " + productoActualizado.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));

        ProductoResponseDTO fotoAnterior = productoMapper.toDto(producto);

        producto.setEstado(false);
        Producto productoEliminado = productoRepository.save(producto);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_PRODUCTO").accion("ELIMINAR")
                .entidadId(productoEliminado.getId())
                .descripcion("Se eliminó (desactivó) el producto base: " + productoEliminado.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(productoMapper.toDto(productoEliminado)).direccionIp("127.0.0.1")
                .build());
    }

    @Override
    @Transactional
    public ProductoResponseDTO cambiarEstado(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));

        ProductoResponseDTO fotoAnterior = productoMapper.toDto(producto);

        producto.setEstado(!producto.getEstado());
        Producto productoActualizado = productoRepository.save(producto);
        ProductoResponseDTO fotoNueva = productoMapper.toDto(productoActualizado);

        eventPublisher.publishEvent(AuditoriaEvent.builder()
                .usuarioId(SecurityUtils.getUsuarioId()).tiendaId(SecurityUtils.getTiendaId())
                .modulo("CATALOGO_PRODUCTO").accion("CAMBIO_ESTADO")
                .entidadId(productoActualizado.getId())
                .descripcion("Se cambió el estado a " + (productoActualizado.getEstado() ? "ACTIVO" : "INACTIVO") + " del producto base: " + productoActualizado.getNombre())
                .valorAnterior(fotoAnterior).valorNuevo(fotoNueva).direccionIp("127.0.0.1")
                .build());

        return fotoNueva;
    }

    private void asignarCategoria(Producto producto, Integer categoriaId) {
        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con ID: " + categoriaId));
            producto.setCategoria(categoria);
        } else {
            producto.setCategoria(null);
        }
    }
}