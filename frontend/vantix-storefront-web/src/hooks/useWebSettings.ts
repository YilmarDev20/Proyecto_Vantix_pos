"use client";

import { useEffect, useState } from "react";

export interface PublicWebConfig {
  id?: number;
  whatsappOficial: string;
  yapeTelefono: string;
  yapeTitular: string;
  yapeQrUrl: string;
  categoriasDestacadasIds: number[];
  bannersUrls: string[];
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export const useWebSettings = () => {
  const [config, setConfig] = useState<PublicWebConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const envApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const apiBase = envApi.endsWith("/api/v1") ? envApi : `${envApi.replace(/\/$/, "")}/api/v1`;

        const res = await fetch(`${apiBase}/public/configuracion-web`);
        if (res.ok) {
          const data: PublicWebConfig = await res.json();
          setConfig(data);
        }
      } catch (error) {
        console.warn("Error al cargar la configuración web pública:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
};