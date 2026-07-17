package com.vantix.pos.modules.customer.service;

import com.vantix.pos.modules.auth.security.SecurityUtils;
import com.vantix.pos.modules.customer.dto.ClienteRequestDTO;
import com.vantix.pos.modules.customer.dto.ClienteResponseDTO;
import com.vantix.pos.modules.customer.entity.Cliente;
import com.vantix.pos.modules.customer.mapper.ClienteMapper;
import com.vantix.pos.modules.customer.repository.ClienteRepository;
import com.vantix.pos.modules.customer.service.impl.ClienteServiceImpl;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;
    @Mock
    private ClienteMapper clienteMapper;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ClienteServiceImpl clienteService;

    private Cliente clienteMock;
    private ClienteRequestDTO requestDTO;
    private ClienteResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        clienteMock = new Cliente();
        clienteMock.setId(1);
        clienteMock.setNombreCompleto("Danilo Pisco");
        clienteMock.setNumeroDocumento("12345678");
        clienteMock.setEstado(true);
        clienteMock.setDeudaActual(BigDecimal.ZERO);

        requestDTO = new ClienteRequestDTO();
        requestDTO.setNombreCompleto("Danilo Pisco");
        requestDTO.setNumeroDocumento("12345678");

        responseDTO = new ClienteResponseDTO();
        responseDTO.setId(1);
        responseDTO.setNombreCompleto("Danilo Pisco");
        responseDTO.setNumeroDocumento("12345678");
    }

    @Test
    void testCrear_LanzaExceptionSiDocumentoYaExiste() {
        // Arrange
        when(clienteRepository.existsByNumeroDocumentoAndEstadoTrue("12345678")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            clienteService.crear(requestDTO);
        });

        assertEquals("Ya existe un cliente con este documento", exception.getMessage());
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void testEliminar_LanzaExceptionSiTieneDeudaActiva() {
        // Arrange
        clienteMock.setDeudaActual(new BigDecimal("150.50")); // Cliente con deuda
        when(clienteRepository.findById(1)).thenReturn(Optional.of(clienteMock));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            clienteService.eliminar(1);
        });

        assertTrue(exception.getMessage().contains("No se puede eliminar un cliente con deuda activa"));
        verify(clienteRepository, never()).save(any(Cliente.class));
    }

    @Test
    void testEliminar_ExitosoSiNoTieneDeudas() {
        try (MockedStatic<SecurityUtils> mockedSecurity = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurity.when(SecurityUtils::getUsuarioId).thenReturn(1);
            mockedSecurity.when(SecurityUtils::getTiendaId).thenReturn(1);

            // Arrange
            when(clienteRepository.findById(1)).thenReturn(Optional.of(clienteMock));
            when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteMock);
            when(clienteMapper.toDto(clienteMock)).thenReturn(responseDTO);

            // Act
            assertDoesNotThrow(() -> clienteService.eliminar(1));

            // Assert
            assertFalse(clienteMock.getEstado()); // Valida desactivación lógica
            verify(clienteRepository, times(1)).save(clienteMock);
        }
    }
}