/**
 * Utilitario Core para el procesamiento de archivos binarios (Blobs) en el navegador.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  // 1. Crear una URL temporal mapeada al objeto binario en memoria
  const url = window.URL.createObjectURL(blob);
  
  // 2. Inyectar un elemento de anclaje virtual invisible en el DOM
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  // 3. Disparar el evento nativo de descarga
  link.click();
  
  // 4. Limpieza del DOM para prevenir fugas de memoria (Memory Leaks)
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};