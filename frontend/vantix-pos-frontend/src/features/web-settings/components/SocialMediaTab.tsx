import type { ConfiguracionWebDTO } from "../types/web-settings.types";

interface Props {
  form: ConfiguracionWebDTO;
  setForm: (form: ConfiguracionWebDTO) => void;
}

export const SocialMediaTab = ({ form, setForm }: Props) => {
  return (
    <div className="space-y-4 max-w-xl">
      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
        Enlaces a Redes Oficiales
      </h3>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
          Página de Facebook:
        </label>
        <input
          type="text"
          value={form.facebookUrl || ""}
          onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
          placeholder="https://facebook.com/zarely"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
          Perfil de Instagram:
        </label>
        <input
          type="text"
          value={form.instagramUrl || ""}
          onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
          placeholder="https://instagram.com/zarely"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
          Cuenta de TikTok:
        </label>
        <input
          type="text"
          value={form.tiktokUrl || ""}
          onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
          placeholder="https://tiktok.com/@zarely"
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
        />
      </div>
    </div>
  );
};