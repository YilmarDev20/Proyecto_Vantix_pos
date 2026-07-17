package com.vantix.pos.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PinRequestDTO {
    @NotBlank(message = "El PIN no puede estar vacío")
    @Pattern(regexp = "^\\d{4}$", message = "El PIN debe tener exactamente 4 dígitos numéricos")
    private String pin;
}