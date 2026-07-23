import { api } from "@/config/api";
import type { ConfiguracionWebDTO } from "../types/web-settings.types";

export const WebSettingsService = {
  // 🚀 CORREGIDO: Quitado el "/v1" inicial
  getConfiguracion: async (): Promise<ConfiguracionWebDTO> => {
    const { data } = await api.get<ConfiguracionWebDTO>("/admin/configuracion-web");
    return data;
  },

  // 🚀 CORREGIDO: Quitado el "/v1" inicial
  guardarConfiguracion: async (dto: ConfiguracionWebDTO): Promise<ConfiguracionWebDTO> => {
    const { data } = await api.put<ConfiguracionWebDTO>("/admin/configuracion-web", dto);
    return data;
  },

  // 🚀 CORREGIDO: Quitado el "/v1" inicial
  subirImagen: async (file: File, carpeta: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("carpeta", carpeta);

    const { data } = await api.post<{ url: string }>("/archivos/subir", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
};