package com.vantix.pos.core.storage.service.impl;

import com.vantix.pos.core.storage.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final String RUTA_BASE = "uploads";

    public FileStorageServiceImpl() {
        try {
            Files.createDirectories(Paths.get(RUTA_BASE, "logos").toAbsolutePath().normalize());
        } catch (IOException e) {
            throw new RuntimeException("Error al inicializar carpetas de almacenamiento");
        }
    }

    @Override
    public String guardarArchivo(MultipartFile file, String subCarpeta) {
        try {
            if (file.isEmpty()) throw new RuntimeException("Archivo vacío");

            Path directorioDestino = Paths.get(RUTA_BASE, subCarpeta).toAbsolutePath().normalize();
            Files.createDirectories(directorioDestino);

            // --- LÓGICA SEGURA PARA EVITAR EL ERROR ---
            String originalFilename = file.getOriginalFilename();
            String extension = ".png"; // Extensión por defecto

            if (originalFilename != null && originalFilename.lastIndexOf(".") != -1) {
                // Solo hacemos substring si encontramos un punto real
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            // -------------------------------------------

            String filename = UUID.randomUUID().toString() + extension;
            Path destinationFile = directorioDestino.resolve(filename);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            return "/" + RUTA_BASE + "/" + subCarpeta + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar archivo", e);
        }
    }

    @Override
    public String guardarLogo(MultipartFile file) {
        return guardarArchivo(file, "logos");
    }
}