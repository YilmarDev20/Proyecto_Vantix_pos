package com.vantix.pos.modules.category.service;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.category.dto.CategoriaRequestDTO;
import com.vantix.pos.modules.category.dto.CategoriaResponseDTO;
import com.vantix.pos.modules.category.entity.Categoria;
import com.vantix.pos.modules.category.mapper.CategoriaMapper;
import com.vantix.pos.modules.category.repository.CategoriaRepository;
import com.vantix.pos.modules.category.service.impl.CategoriaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private CategoriaMapper categoriaMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CategoriaServiceImpl categoriaService;

    private Categoria categoriaMock;
    private Categoria padreMock;
    private CategoriaRequestDTO requestDTO;
    private CategoriaResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        padreMock = new Categoria();
        padreMock.setId(5);
        padreMock.setNombre("Damas");

        categoriaMock = new Categoria();
        categoriaMock.setId(10);
        categoriaMock.setNombre("Blusas");
        categoriaMock.setEstado(true);

        requestDTO = new CategoriaRequestDTO();
        requestDTO.setNombre("Blusas");
        requestDTO.setCategoriaPadreId(5);

        responseDTO = new CategoriaResponseDTO();
        responseDTO.setId(10);
        responseDTO.setNombre("Blusas");
    }

    @Test
    void testCrear_ConCategoriaPadreExitoso() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioId).thenReturn(1);
            mockedSecurity.when(SecurityUtils::getTiendaId).thenReturn(1);

            // Arrange
            when(categoriaMapper.toEntity(requestDTO)).thenReturn(categoriaMock);
            when(categoriaRepository.findById(5)).thenReturn(Optional.of(padreMock));
            when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoriaMock);
            when(categoriaMapper.toDto(categoriaMock)).thenReturn(responseDTO);

            // Act
            CategoriaResponseDTO resultado = categoriaService.crear(requestDTO);

            // Assert
            assertNotNull(resultado);
            assertEquals("Blusas", resultado.getNombre());
            verify(categoriaRepository, times(1)).findById(5);
            verify(categoriaRepository, times(1)).save(categoriaMock);
        }
    }

    @Test
    void testObtenerPorId_LanzaExceptionCuandoNoExiste() {
        // Arrange
        when(categoriaRepository.findById(99)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            categoriaService.obtenerPorId(99);
        });

        assertEquals("Categoría no encontrada", exception.getMessage());
        verify(categoriaRepository, times(1)).findById(99);
        verifyNoInteractions(categoriaMapper);
    }
}