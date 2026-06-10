import { Layers, AlertCircle, PackageCheck, DollarSign } from 'lucide-react';

export const VariantKPIs = ({ total, alertas, packs, valorTotal }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Layers className="w-6 h-6" /></div>
      <div><p className="text-sm text-slate-500 font-medium">Total Variantes</p><h4 className="text-2xl font-bold text-slate-800">{total}</h4></div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle className="w-6 h-6" /></div>
      <div><p className="text-sm text-slate-500 font-medium">Bajo Stock</p><h4 className="text-2xl font-bold text-slate-800">{alertas}</h4></div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><PackageCheck className="w-6 h-6" /></div>
      <div><p className="text-sm text-slate-500 font-medium">Packs Cerrados</p><h4 className="text-2xl font-bold text-slate-800">{packs}</h4></div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
      <div><p className="text-sm text-slate-500 font-medium">Valor Inventario</p><h4 className="text-2xl font-bold text-slate-800">S/ {valorTotal}</h4></div>
    </div>
  </div>
);