package com.vantix.pos.modules.catalog.product.service;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.catalog.product.dto.ProductoRequestDTO;
import com.vantix.pos.modules.catalog.product.dto.ProductoResponseDTO;
import com.vantix.pos.modules.catalog.product.entity.Producto;
import com.vantix.pos.modules.catalog.product.enums.UnidadMedida;
import com.vantix.pos.modules.catalog.product.mapper.ProductoMapper;
import com.vantix.pos.modules.catalog.product.repository.ProductoRepository;
import com.vantix.pos.modules.catalog.product.service.impl.ProductoServiceImpl;
import com.vantix.pos.modules.category.repository.CategoriaRepository;
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

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoMapper productoMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProductoServiceImpl productoService;

    private Producto productoMock;
    private ProductoRequestDTO requestDTO;
    private ProductoResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        productoMock = new Producto();
        productoMock.setId(1);
        productoMock.setNombre("Blusa Zarely Bomba");
        productoMock.setEstado(true);
        productoMock.setUnidadMedida(UnidadMedida.NIU);
        productoMock.setPacksSurtidos(new ArrayList<>());

        requestDTO = new ProductoRequestDTO();
        requestDTO.setNombre("Blusa Zarely Bomba");
        requestDTO.setCategoriaId(null);
        requestDTO.setPacksSurtidos(new ArrayList<>());

        responseDTO = new ProductoResponseDTO();
        responseDTO.setId(1);
        responseDTO.setNombre("Blusa Zarely Bomba");
        responseDTO.setEstado(true);
    }

    @Test
    void testObtenerPorId_Exitoso() {
        when(productoRepository.findById(1)).thenReturn(Optional.of(productoMock));
        when(productoMapper.toDto(productoMock)).thenReturn(responseDTO);

        ProductoResponseDTO resultado = productoService.obtenerPorId(1);

        assertNotNull(resultado);
        assertEquals(1, resultado.getId());
        assertEquals("Blusa Zarely Bomba", resultado.getNombre());
        verify(productoRepository, times(1)).findById(1);
    }

    @Test
    void testObtenerPorId_LanzaExceptionCuandoNoExiste() {
        when(productoRepository.findById(99)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            productoService.obtenerPorId(99);
        });

        assertEquals("Producto no encontrado con ID: 99", exception.getMessage());
        verify(productoRepository, times(1)).findById(99);
        verifyNoInteractions(productoMapper);
    }

    @Test
    void testCambiarEstado_InvierteEstadoCorrectamente() {
        // Simulamos los métodos estáticos de SecurityUtils usando try-with-resources
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioId).thenReturn(1);
            mockedSecurity.when(SecurityUtils::getTiendaId).thenReturn(1);

            when(productoRepository.findById(1)).thenReturn(Optional.of(productoMock));
            when(productoRepository.save(any(Producto.class))).thenAnswer(invocation -> invocation.getArgument(0));

            responseDTO.setEstado(false);
            when(productoMapper.toDto(any(Producto.class))).thenReturn(responseDTO);

            ProductoResponseDTO resultado = productoService.cambiarEstado(1);

            assertNotNull(resultado);
            assertFalse(resultado.getEstado());
            verify(productoRepository, times(1)).findById(1);
            verify(productoRepository, times(1)).save(productoMock);
        }
    }
}