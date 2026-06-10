package com.vantix.pos.core.storage.controller;

import com.vantix.pos.core.storage.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/archivos")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/subir")
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "carpeta", defaultValue = "productos") String carpeta) {

        // DEBUG: Agrega esto
        System.out.println("Archivo recibido: " + file.getOriginalFilename() + " Carpeta: " + carpeta);

        String urlImagen = fileStorageService.guardarArchivo(file, carpeta);
        return ResponseEntity.ok(Map.of("url", urlImagen));
    }
}