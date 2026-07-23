import {Trash2, Upload } from "lucide-react";
import type { ConfiguracionWebDTO } from "../types/web-settings.types";

interface Props {
  form: ConfiguracionWebDTO;
  setForm: (form: ConfiguracionWebDTO) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, carpeta: string, callback: (url: string) => void) => void;
  apiBase: string;
}

export const PaymentSettingsTab = ({ form, setForm, onFileUpload, apiBase }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
          Líneas de Atención y Cobro
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            WhatsApp Oficial Zarely:
          </label>
          <input
            type="text"
            value={form.whatsappOficial}
            onChange={(e) => setForm({ ...form, whatsappOficial: e.target.value })}
            placeholder="Ej: 927780621"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            Teléfono Yape / Plin:
          </label>
          <input
            type="text"
            value={form.yapeTelefono}
            onChange={(e) => setForm({ ...form, yapeTelefono: e.target.value })}
            placeholder="Ej: 927780621"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
            Titular de la Cuenta:
          </label>
          <input
            type="text"
            value={form.yapeTitular}
            onChange={(e) => setForm({ ...form, yapeTitular: e.target.value })}
            placeholder="Ej: Zarely Moda & Accesorios"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
          Código QR de Pago (Yape/Plin)
        </h3>

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-950">
          {form.yapeQrUrl ? (
            <div className="relative group">
              <img
                src={form.yapeQrUrl.startsWith("http") ? form.yapeQrUrl : `${apiBase}${form.yapeQrUrl}`}
                alt="QR Yape"
                className="max-h-48 object-contain rounded-xl shadow-md"
              />
              <button
                onClick={() => setForm({ ...form, yapeQrUrl: "" })}
                className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:scale-110 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer space-y-2">
              <Upload className="w-8 h-8 text-fuchsia-500" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Subir Imagen del QR de Yape
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileUpload(e, "web_qr", (url) => setForm({ ...form, yapeQrUrl: url }))}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};