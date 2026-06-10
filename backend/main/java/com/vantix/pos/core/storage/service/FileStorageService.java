package com.vantix.pos.core.storage.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String guardarArchivo(MultipartFile file, String subCarpeta);
    String guardarLogo(MultipartFile file);
}