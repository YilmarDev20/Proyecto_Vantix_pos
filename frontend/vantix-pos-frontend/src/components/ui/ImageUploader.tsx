import { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { api } from '@/config/api'; 

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  folder: 'productos' | 'variantes';
  initialUrl?: string | null;
}

export const ImageUploader = ({ onImageUploaded, folder, initialUrl }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  // 2. AÑADE ESTE EFECTO (La pieza clave)
  useEffect(() => {
    if (initialUrl) {
      setPreview(initialUrl);
    }
  }, [initialUrl]); // Cada vez que initialUrl cambie, actualizamos el preview

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      toast.loading('Optimizando imagen...');

      // Comprimir a máximo 500KB y 800px de ancho
      const options = {
        maxSizeMB: 0.5,           // Asegura que pese 500KB o menos
        maxWidthOrHeight: 1024,   // Redimensiona si es muy grande
        useWebWorker: true,
        initialQuality: 0.8       // Calidad al 80% (imperceptible al ojo humano)
         };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('carpeta', folder); // Coincide con tu Backend

      const response = await api.post('/archivos/subir', formData, {
        
      });

      const imageUrl = response.data.url;
      setPreview(imageUrl);
      onImageUploaded(imageUrl);
      toast.dismiss();
      toast.success('Imagen subida');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 h-40 flex items-center justify-center overflow-hidden">
        {preview ? (
          <>
            {/* VITE_API_URL debe estar en tu .env apuntando a tu servidor o localhost */}
            <img src={`${import.meta.env.VITE_BASE_URL}${preview}`} alt="Preview" className="w-full h-full object-cover" />
            <button type="button" onClick={() => { setPreview(null); onImageUploaded(''); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <label className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-primary">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-xs font-bold">Subir foto</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};