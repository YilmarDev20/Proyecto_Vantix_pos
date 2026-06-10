import { useEffect, useState } from 'react';
import { Plus, FileSpreadsheet, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ProductService } from '../services/product.api';
import { CategoryService } from '../../category/services/category.api';
import type { Product } from '../types/product.types';
import { useAuth } from '@/core/auth/context/AuthContext';
import { downloadBlob } from '@/core/utils/download.util';

import { ProductKPIs } from '../components/ProductKPIs';
import { ProductFilters } from '../components/ProductFilters';
import { ProductTable } from '../components/ProductTable';
import { ProductMobileCards } from '../components/ProductMobileCards';
import { ProductImageOverlay } from '../components/ProductImageOverlay';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { VariantService } from '../../variant/services/variant.api'; // <-- IMPORTA TU SERVICIO DE VARIANTES


export const ProductView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ROLE_ADMIN';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle'>('delete');

  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Estados reactivos para controlar el feedback visual de las descargas binarias
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prodData, catData] = await Promise.all([ProductService.getAll(), CategoryService.getAll()]);
      setProducts(prodData);
      setCategories(catData);
    } catch (error) {
      toast.error('Error al cargar la información del catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      toast.loading('Generando reporte Excel...', { id: 'export-excel' });
      
      // MANDATORIO: Pasamos el ID de la tienda activa (ej: 2 para Dos Palmas o el ID de tu contexto)
      const tiendaActivaId = 2; 
      
      const blob = await VariantService.exportExcel(tiendaActivaId); 
      downloadBlob(blob, `Inventario_Detallado_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('¡Excel descargado con éxito!', { id: 'export-excel' });
    } catch (error) {
      toast.error('Error al compilar el archivo Excel', { id: 'export-excel' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      toast.loading('Estructurando documento PDF...', { id: 'export-pdf' });
      
      const tiendaActivaId = 2; // ID de Dos Palmas
      
      const blob = await VariantService.exportPdf(tiendaActivaId); 
      downloadBlob(blob, `Inventario_Maestro_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('¡PDF descargado con éxito!', { id: 'export-pdf' });
    } catch (error) {
      toast.error('Error al renderizar el documento PDF', { id: 'export-pdf' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedProduct) return;
    try {
      if (actionType === 'delete') {
        await ProductService.delete(selectedProduct.id);
        toast.success('Producto eliminado permanentemente');
      } else if (actionType === 'toggle') {
        await ProductService.toggleStatus(selectedProduct.id);
        toast.success(`Producto ${selectedProduct.estado ? 'desactivado' : 'activado'}`);
      }
      setIsConfirmOpen(false);
      loadData();
    } catch (error: any) {
      if (actionType === 'delete') {
        toast.error('No se puede eliminar. Tiene variantes asociadas. Por favor, desactívala.');
      } else {
        toast.error('Error al procesar la solicitud');
      }
      setIsConfirmOpen(false);
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Desconocida';
  };

  const handleNavigateVariants = (id: number) => {
    navigate(`/inventory/product/${id}/variants`);
  };

  const handleEditClick = (id: number) => {
    navigate(`/inventory/product/edit/${id}`);
  };

  const handleToggleClick = (prod: Product) => {
    setSelectedProduct(prod);
    setActionType('toggle');
    setIsConfirmOpen(true);
  };

  const handleDeleteClick = (prod: Product) => {
    setSelectedProduct(prod);
    setActionType('delete');
    setIsConfirmOpen(true);
  };

  const handleImageZoomClick = (url: string, name: string) => {
    setZoomedImage({ url, title: name });
  };

  const filteredProducts = products.filter((prod) => {
    const searchLower = searchTerm.toLowerCase();
    const categoryName = getCategoryName(prod.categoriaId).toLowerCase();
    const matchesSearch = prod.nombre.toLowerCase().includes(searchLower) || (prod.marca && prod.marca.toLowerCase().includes(searchLower)) || categoryName.includes(searchLower) || (prod.etiquetas && prod.etiquetas.some(tag => tag.toLowerCase().includes(searchLower)));
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? prod.estado === true : prod.estado === false;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ProductKPIs total={products.length} activos={products.filter(p => p.estado).length} inactivos={products.filter(p => !p.estado).length} conEtiquetas={products.filter(p => p.etiquetas && p.etiquetas.length > 0).length} />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Cabecera Responsiva con Bloque de Acciones Reutilizables */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Catálogo Base (Productos Padre)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administra los nombres, marcas y agrupaciones de tus artículos.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
            {/* BOTÓN EXCEL */}
            <button
              type="button"
              disabled={isExportingExcel || isLoading}
              onClick={handleExportExcel}
              className="flex items-center justify-center px-3 py-2 bg-emerald-600 dark:bg-emerald-700 text-white font-medium text-sm rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              title="Exportar catálogo a Excel via Apache POI"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              {isExportingExcel ? 'Procesando...' : 'Excel'}
            </button>

            {/* BOTÓN PDF */}
            <button
              type="button"
              disabled={isExportingPdf || isLoading}
              onClick={handleExportPdf}
              className="flex items-center justify-center px-3 py-2 bg-rose-600 dark:bg-rose-700 text-white font-medium text-sm rounded-lg hover:bg-rose-700 dark:hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              title="Exportar catálogo a PDF via OpenPDF"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              {isExportingPdf ? 'Estructurando...' : 'PDF'}
            </button>

            {/* BOTÓN CREAR NUEVO PRODUCTO */}
            {isAdmin && (
              <button 
                type="button" 
                onClick={() => navigate('/inventory/product/new')} 
                className="flex items-center justify-center px-4 py-2 bg-primary dark:bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Nuevo Producto Padre
              </button>
            )}
          </div>
        </div>

        <ProductFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} statusFilter={statusFilter} onStatusChange={setStatusFilter} />

        {/* VISTA MÓVIL DESACOPLADA */}
        {isLoading ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">No hay productos que coincidan.</div>
        ) : (
          <ProductMobileCards 
            products={filteredProducts}
            isAdmin={isAdmin}
            getCategoryName={getCategoryName}
            onNavigateVariants={handleNavigateVariants}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleClick}
            onDelete={handleDeleteClick}
            onImageZoom={handleImageZoomClick}
          />
        )}

        {/* VISTA ESCRITORIO DESACOPLADA */}
        {!isLoading && filteredProducts.length > 0 && (
          <ProductTable 
            products={filteredProducts}
            isAdmin={isAdmin}
            getCategoryName={getCategoryName}
            onNavigateVariants={handleNavigateVariants}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleClick}
            onDelete={handleDeleteClick}
            onImageZoom={handleImageZoomClick}
          />
        )}
      </div>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmAction} title={actionType === 'delete' ? 'Eliminar Producto' : 'Cambiar Estado'} message={actionType === 'delete' ? `¿Estás seguro de eliminar "${selectedProduct?.nombre}"?` : `¿Deseas ${selectedProduct?.estado ? 'desactivar' : 'activar'} el producto "${selectedProduct?.nombre}"?`} confirmText={actionType === 'delete' ? 'Eliminar' : (selectedProduct?.estado ? 'Desactivar' : 'Activar')} isDestructive={actionType === 'delete' || (selectedProduct?.estado ?? false)} />

      <ProductImageOverlay 
        isOpen={zoomedImage !== null}
        imageUrl={zoomedImage?.url ?? null}
        productName={zoomedImage?.title ?? ''}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
};