import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { ProductForm } from '../components/ProductForm';
import { ProductService } from '../services/product.api';
import { CategoryService } from '../../category/services/category.api';
import type { Product, ProductRequest } from '../types/product.types';

export const ProductFormView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditing = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<Product | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await CategoryService.getAll();
        setCategories(cats.filter(c => c.estado));

        if (isEditing) {
          const productData = await ProductService.getById(Number(id));
          setInitialData(productData);
        }
      } catch (error) {
        toast.error('Error al cargar la información');
        navigate('/inventory');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [id, isEditing, navigate]);

  const handleSaveProduct = async (data: ProductRequest) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await ProductService.update(Number(id), data);
        toast.success('Producto actualizado correctamente');
        navigate('/inventory');
      } else {
        await ProductService.create(data);
        toast.success('¡Producto Creado! Ahora configura sus variantes.');
        navigate('/inventory');
      }
    } catch (error) {
      toast.error('Ocurrió un error al guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando datos del producto...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          type="button"
          onClick={() => navigate('/inventory')}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {isEditing ? 'Editar Producto Padre' : 'Crear Nuevo Producto'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEditing ? 'Modifica la información base de este artículo.' : 'Define el producto padre base antes de configurar sus tallas, colores o packs.'}
          </p>
        </div>
      </div>

      <ProductForm 
        initialData={initialData}
        categories={categories} 
        onSubmit={handleSaveProduct} 
        onCancel={() => navigate('/inventory')} 
        isLoading={isSaving} 
      />
    </div>
  );
};