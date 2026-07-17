package com.vantix.pos.modules.catalog.variant.service;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.repository.ProductoRepository;
import com.vantix.pos.modules.catalog.variant.dto.VarianteRequestDTO;
import com.vantix.pos.modules.catalog.variant.dto.VarianteResponseDTO;
import com.vantix.pos.modules.catalog.variant.entity.Variante;
import com.vantix.pos.modules.catalog.variant.mapper.VarianteMapper;
import com.vantix.pos.modules.catalog.variant.repository.VarianteRepository;
import com.vantix.pos.modules.catalog.variant.service.impl.VarianteServiceImpl;
import com.vantix.pos.modules.inventory.stock.entity.InventarioTienda;
import com.vantix.pos.modules.inventory.stock.repository.InventarioTiendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VarianteServiceTest {

    @Mock
    private VarianteRepository varianteRepository;
    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private VarianteMapper varianteMapper;
    @Mock
    private InventarioTiendaRepository inventarioTiendaRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private VarianteServiceImpl varianteService;

    private VarianteRequestDTO requestDTO;
    private Variante varianteMock;
    private Producto productoMock;

    @BeforeEach
    void setUp() {
        productoMock = new Producto();
        productoMock.setId(10);
        productoMock.setNombre("Vestido Zarely Elegante");

        varianteMock = new Variante();
        varianteMock.setId(1);
        varianteMock.setSku("GEN-10-ABC123");
        varianteMock.setProducto(productoMock);
        varianteMock.setPrecioCompra(new BigDecimal("30.00"));
        varianteMock.setPrecioVenta(new BigDecimal("50.00"));
        varianteMock.setPresentaciones(new ArrayList<>());

        requestDTO = new VarianteRequestDTO();
        requestDTO.setProductoId(10);
        requestDTO.setPrecioCompra(new BigDecimal("30.00"));
        requestDTO.setPrecioVenta(new BigDecimal("50.00"));
        requestDTO.setStockMinimo(5);
        requestDTO.setPresentaciones(new ArrayList<>());
    }

    @Test
    void testCrear_LanzaExceptionSiPrecioVentaEsMenorACostoCompra() {
        // Arrange
        requestDTO.setPrecioCompra(new BigDecimal("40.00"));
        requestDTO.setPrecioVenta(new BigDecimal("25.00")); // Conflicto financiero

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            varianteService.crear(requestDTO, 1);
        });

        assertEquals("El precio de venta no puede ser menor que el costo de compra.", exception.getMessage());
        verifyNoInteractions(varianteRepository);
    }

    @Test
    void testCrear_ExitosoConInicializacionDeInventario() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioId).thenReturn(1);
            mockedSecurity.when(SecurityUtils::getTiendaId).thenReturn(1);

            // Arrange
            when(varianteMapper.toEntity(requestDTO)).thenReturn(varianteMock);
            when(productoRepository.findById(10)).thenReturn(Optional.of(productoMock));
            when(varianteRepository.save(any(Variante.class))).thenReturn(varianteMock);
            when(inventarioTiendaRepository.save(any(InventarioTienda.class))).thenReturn(new InventarioTienda());
            when(varianteMapper.toDto(varianteMock)).thenReturn(new VarianteResponseDTO());

            // Act
            VarianteResponseDTO resultado = varianteService.crear(requestDTO, 1);

            // Assert
            assertNotNull(resultado);
            verify(varianteRepository, times(1)).save(any(Variante.class));
            verify(inventarioTiendaRepository, times(1)).save(any(InventarioTienda.class));
        }
    }

    @Test
    void testObtenerPorId_LanzaExceptionCuandoNoExiste() {
        // Arrange
        when(varianteRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            varianteService.obtenerPorId(999);
        });

        assertEquals("Variante no encontrada con ID: 999", exception.getMessage());
    }
}