package com.vantix.pos.modules.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClienteRequestDTO {
    private String tipoDocumento;

    // ---> ACTUALIZADO: Ya no tiene @NotBlank
    @Size(max = 50)
    private String numeroDocumento;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 200)
    private String nombreCompleto;

    // ---> ACTUALIZADO: Ahora es obligatorio
    @NotBlank(message = "El teléfono es obligatorio para contactar al cliente")
    private String telefono;

    private String email;
    private BigDecimal lineaCreditoMaxima;
}