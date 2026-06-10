package com.vantix.pos.modules.auth.service;

import com.vantix.pos.modules.auth.dto.AuthRequestDTO;
import com.vantix.pos.modules.auth.dto.AuthResponseDTO;
import com.vantix.pos.modules.auth.security.CustomUserDetails;
import com.vantix.pos.modules.auth.security.JwtService;
import com.vantix.pos.modules.users.entity.Usuario;
import com.vantix.pos.modules.users.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthResponseDTO login(AuthRequestDTO request) {
        // 1. Spring Security verifica si el email y la contraseña hacen match
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Extraemos al usuario
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Usuario usuario = userDetails.getUsuario();

        if (!usuario.getEstado()) {
            throw new IllegalStateException("Usuario inactivo. Contacte al administrador.");
        }

        // 3. Generamos el Carnet (Token)
        String jwtToken = jwtService.generateToken(userDetails);

        // 4. Devolvemos la data para el AuthContext de React
        return AuthResponseDTO.builder()
                .token(jwtToken)
                .usuarioId(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .tiendaId(usuario.getTienda() != null ? usuario.getTienda().getId() : null)
                .tiendaNombre(usuario.getTienda() != null ? usuario.getTienda().getNombre() : "Sin Sucursal")
                .build();
    }
}