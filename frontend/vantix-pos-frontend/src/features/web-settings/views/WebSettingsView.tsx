import { useEffect, useState } from "react";
import { Settings, Save, QrCode, Image as ImageIcon, LayoutGrid, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WebSettingsService } from "../services/web-settings.api";
import type { ConfiguracionWebDTO } from "../types/web-settings.types";
import { CategoryService } from "@/features/inventory/category/services/category.api";
import { PaymentSettingsTab } from "../components/PaymentSettingsTab";
import { BannersTab } from "../components/BannersTab";
import { CategoriesTab } from "../components/CategoriesTab";
import { SocialMediaTab } from "../components/SocialMediaTab";

export const WebSettingsView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"yape" | "banners" | "categorias" | "redes">("yape");

  const [form, setForm] = useState<ConfiguracionWebDTO>({
    whatsappOficial: "927780621",
    yapeTelefono: "927780621",
    yapeTitular: "Zarely Moda & Accesorios",
    yapeQrUrl: "",
    categoriasDestacadasIds: [],
    bannersUrls: [],
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
  });

  const apiBase = import.meta.env.DEV ? "http://localhost:8080" : "http://159.89.54.99";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [configData, catsData] = await Promise.all([
          WebSettingsService.getConfiguracion(),
          CategoryService.getAll().catch(() => []),
        ]);
        setForm(configData);
        setCategorias(catsData);
      } catch (error) {
        console.error("Error al cargar configuración web:", error);
        toast.error("No se pudo cargar la configuración web");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await WebSettingsService.guardarConfiguracion(form);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, carpeta: string, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await WebSettingsService.subirImagen(file, carpeta);
      callback(url);
      toast.success("Imagen subida con éxito");
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.error("No se pudo subir la imagen");
    }
  };

  const handleToggleCategoria = (catId: number) => {
    const current = form.categoriasDestacadasIds || [];
    if (current.includes(catId)) {
      setForm({ ...form, categoriasDestacadasIds: current.filter((id) => id !== catId) });
    } else {
      if (current.length >= 3) {
        toast.warning("Límite alcanzado", {
          description: "Solo puedes seleccionar un máximo de 3 categorías destacadas.",
        });
        return;
      }
      setForm({ ...form, categoriasDestacadasIds: [...current, catId] });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 animate-pulse text-sm">Cargando configuración web...</div>;
  }

  return (
    <div className="p-2 sm:p-4 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Configuración Web</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administra los banners del inicio, número de WhatsApp, QR de Yape y categorías destacadas.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("yape")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === "yape"
              ? "bg-white dark:bg-slate-900 text-fuchsia-600 border-t border-x border-slate-200 dark:border-slate-800 border-b-transparent"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Atención & Pagos</span>
        </button>

        <button
          onClick={() => setActiveTab("banners")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === "banners"
              ? "bg-white dark:bg-slate-900 text-fuchsia-600 border-t border-x border-slate-200 dark:border-slate-800 border-b-transparent"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Banners Carrusel ({form.bannersUrls?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("categorias")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === "categorias"
              ? "bg-white dark:bg-slate-900 text-fuchsia-600 border-t border-x border-slate-200 dark:border-slate-800 border-b-transparent"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Categorías Destacadas ({form.categoriasDestacadasIds?.length || 0}/3)</span>
        </button>

        <button
          onClick={() => setActiveTab("redes")}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === "redes"
              ? "bg-white dark:bg-slate-900 text-fuchsia-600 border-t border-x border-slate-200 dark:border-slate-800 border-b-transparent"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Redes Sociales</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        {activeTab === "yape" && (
          <PaymentSettingsTab form={form} setForm={setForm} onFileUpload={handleFileUpload} apiBase={apiBase} />
        )}
        {activeTab === "banners" && (
          <BannersTab form={form} setForm={setForm} onFileUpload={handleFileUpload} apiBase={apiBase} />
        )}
        {activeTab === "categorias" && (
          <CategoriesTab form={form} categorias={categorias} onToggleCategoria={handleToggleCategoria} />
        )}
        {activeTab === "redes" && <SocialMediaTab form={form} setForm={setForm} />}
      </div>
    </div>
  );
};