package com.vantix.pos.modules.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class PinDinamicoUtil {

    // La "Semilla Secreta". Si cambias esto, todos los PINs generados cambian.
    private static final String SECRET_SEED = "VANTIX_POS_SECURE_TOTP_2026";
    // Bloques de 5 minutos (300,000 milisegundos)
    private static final long TIME_STEP_MS = 5 * 60 * 1000;

    /**
     * Calcula el PIN válido en este exacto momento.
     */
    public static String generarPinActual() {
        long timeIndex = System.currentTimeMillis() / TIME_STEP_MS;
        return calcularHash(timeIndex);
    }

    /**
     * Valida si el PIN ingresado por el cajero es correcto.
     * Tiene una tolerancia de 1 bloque anterior por si el minuto cambió justo cuando lo digitó.
     */
    public static boolean validarPin(String pinIngresado) {
        if (pinIngresado == null || pinIngresado.trim().isEmpty()) return false;

        long timeIndex = System.currentTimeMillis() / TIME_STEP_MS;

        // 1. Verificamos el PIN del bloque actual
        if (calcularHash(timeIndex).equals(pinIngresado)) return true;

        // 2. Verificamos el PIN del bloque anterior (Tolerancia de retraso)
        if (calcularHash(timeIndex - 1).equals(pinIngresado)) return true;

        return false;
    }

    /**
     * Calcula cuántos segundos le quedan de vida al PIN actual antes de mutar.
     */
    public static long obtenerSegundosRestantes() {
        long elapsed = System.currentTimeMillis() % TIME_STEP_MS;
        return (TIME_STEP_MS - elapsed) / 1000;
    }

    /**
     * Algoritmo SHA-256 para convertir el Tiempo + Semilla en un número de 4 dígitos.
     */
    private static String calcularHash(long timeIndex) {
        try {
            String dataToHash = SECRET_SEED + timeIndex;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(dataToHash.getBytes(StandardCharsets.UTF_8));

            // Tomamos los primeros bytes para crear un número entero
            int number = ((hash[0] & 0xFF) << 16) | ((hash[1] & 0xFF) << 8) | (hash[2] & 0xFF);
            // Obtenemos 4 dígitos (0000 al 9999)
            int pin = number % 10000;

            return String.format("%04d", pin);
        } catch (Exception e) {
            throw new RuntimeException("Error fatal en el motor criptográfico de Vantix POS", e);
        }
    }
}