import { Plus, Trash2 } from "lucide-react";
import type { ConfiguracionWebDTO } from "../types/web-settings.types";

interface Props {
  form: ConfiguracionWebDTO;
  setForm: (form: ConfiguracionWebDTO) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, carpeta: string, callback: (url: string) => void) => void;
  apiBase: string;
}

export const BannersTab = ({ form, setForm, onFileUpload, apiBase }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
          Imágenes Promocionales del Inicio (Carrusel Web)
        </h3>

        <label className="inline-flex items-center space-x-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer shadow-xs transition-all">
          <Plus className="w-4 h-4" />
          <span>Agregar Banner</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              onFileUpload(e, "web_banners", (url) =>
                setForm({ ...form, bannersUrls: [...(form.bannersUrls || []), url] })
              )
            }
          />
        </label>
      </div>

      {form.bannersUrls && form.bannersUrls.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {form.bannersUrls.map((url, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={url.startsWith("http") ? url : `${apiBase}${url}`}
                alt={`Banner ${idx + 1}`}
                className="object-cover w-full h-full"
              />
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    bannersUrls: form.bannersUrls.filter((_, i) => i !== idx),
                  })
                }
                className="absolute top-2 right-2 bg-rose-600/90 hover:bg-rose-600 text-white p-1.5 rounded-lg shadow-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No hay banners agregados. Haz clic en "Agregar Banner" para subir promociones.
        </div>
      )}
    </div>
  );
};