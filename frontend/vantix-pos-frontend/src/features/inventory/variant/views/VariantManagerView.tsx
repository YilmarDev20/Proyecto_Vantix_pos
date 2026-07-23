import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Servicios y tipos
import { VariantService } from '../services/variant.api';
import { ProductService } from '../../product/services/product.api';
import type { Variant, VariantRequest } from '../types/variant.types';
import type { Product } from '../../product/types/product.types';

// Componentes desacoplados de presentación
import { VariantKPIs } from '../components/VariantKPIs';
import { VariantFilters } from '../components/VariantFilters';
import { VariantTable } from '../components/VariantTable';
import { VariantMobileCards } from '../components/VariantMobileCards';
import { VariantImageOverlay } from '../components/VariantImageOverlay';
import { VariantFormView } from './VariantFormView'; // 🚀 NUEVA VISTA PANTALLA COMPLETA

// Componentes comunes UI
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useStore } from '@/core/store/context/StoreContext'; 
import { useAuth } from '@/core/auth/context/AuthContext'; 

export const VariantManagerView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { user } = useAuth(); 
  const isAdmin = user?.rol === 'ROLE_ADMIN'; 

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [packFilter, setPackFilter] = useState<'all' | 'units' | 'packs'>('all');
  const [sortBy, setSortBy] = useState<'none' | 'price-asc' | 'price-desc'>('none');

  // 🚀 CAMBIO CLAVE: Reemplazamos el estado 'isModalOpen' por 'isFormOpen'
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'toggle'>('delete');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del visor de imagen flotante
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  const loadData = async () => {
    if (!productId) return;
    const tiendaIdQuery = activeStoreId || 1; 
    try {
      setIsLoading(true);
      const [prodData, varData] = await Promise.all([
        ProductService.getById(Number(productId)), 
        VariantService.getByProduct(Number(productId), tiendaIdQuery)
      ]);
      setProduct(prodData);
      setVariants(varData);
    } catch (error) {
      toast.error('Error al cargar la información del inventario');
      navigate('/inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [productId, activeStoreId]);

  const handleSaveVariant = async (data: VariantRequest) => {
    try {
      setIsSubmitting(true);
      const tiendaIdQuery = activeStoreId || 1;
      if (selectedVariant) {
        await VariantService.update(selectedVariant.id, data, tiendaIdQuery);
        toast.success('Variante actualizada con éxito');
      } else {
        await VariantService.create(data, tiendaIdQuery);
        toast.success('Variante creada. SKU Autogenerado con éxito.');
      }
      setIsFormOpen(false); // 🚀 Cerramos el formulario de pantalla completa
      loadData();
    } catch (error) {
      toast.error('Error al guardar la variante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedVariant) return;
    try {
      if (actionType === 'delete') {
        await VariantService.delete(selectedVariant.id);
        toast.success('Variante eliminada permanentemente');
      } else if (actionType === 'toggle') {
        await VariantService.toggleStatus(selectedVariant.id);
        toast.success(`Estado actualizado correctamente`);
      }
      setIsConfirmOpen(false);
      loadData();
    } catch (error) {
      toast.error('No se puede eliminar porque tiene historial. Por favor, desactívala.');
      setIsConfirmOpen(false);
    }
  };

  const formatAtributos = (atributos: Record<string, any> | null) => {
    if (!atributos) return 'Estándar';
    return Object.entries(atributos).map(([key, val]) => `${key}: ${val}`).join(' | ');
  };

  const handleEditClick = (v: Variant) => {
    setSelectedVariant(v);
    setIsFormOpen(true); // 🚀 Abrir en pantalla completa
  };

  const handleToggleClick = (v: Variant) => {
    setSelectedVariant(v);
    setActionType('toggle');
    setIsConfirmOpen(true);
  };

  const handleDeleteClick = (v: Variant) => {
    setSelectedVariant(v);
    setActionType('delete');
    setIsConfirmOpen(true);
  };

  const handleImageZoomClick = (url: string, sku: string) => {
    setZoomedImage({ url, title: sku });
  };

  let processedVariants = variants.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = v.sku.toLowerCase().includes(term) || (v.codigoBarras && v.codigoBarras.toLowerCase().includes(term)) || formatAtributos(v.atributos).toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? v.estado : !v.estado;
    const tieneEmpaques = v.presentaciones && v.presentaciones.length > 0;
    const matchesPack = packFilter === 'all' ? true : packFilter === 'packs' ? tieneEmpaques : !tieneEmpaques;
    return matchesSearch && matchesStatus && matchesPack;
  });

  if (sortBy === 'price-asc') {
    processedVariants.sort((a, b) => a.precioVenta - b.precioVenta);
  } else if (sortBy === 'price-desc') {
    processedVariants.sort((a, b) => b.precioVenta - a.precioVenta);
  }

  const totalValor = variants.reduce((acc, curr) => acc + (curr.precioCompra * curr.stockActual), 0).toFixed(2);

  if (isLoading && !product) return <div className="p-8 text-center text-slate-500">Cargando inventario...</div>;

  // 🚀 SI SE HACE CLIC EN CREAR O EDITAR, RENDERIZAMOS LA VISTA COMPLETA (SIN MODAL)
  if (isFormOpen) {
    return (
      <VariantFormView
        productId={Number(productId)}
        productName={product?.nombre}
        initialData={selectedVariant}
        onSubmit={handleSaveVariant}
        onBack={() => setIsFormOpen(false)}
        isLoading={isSubmitting}
      />
    );
  }

  // 🚀 VISTA PRINCIPAL (LISTA / TABLA)
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center space-x-4">
          <button type="button" onClick={() => navigate('/inventory')} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inventario: {product?.nombre}</h2>
            <p className="text-sm text-slate-500">
              Marca: <span className="font-medium text-slate-700">{product?.marca || 'N/A'}</span> • 
              UoM: <span className="font-medium text-slate-700">{product?.unidadMedida}</span>
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <button type="button" onClick={() => { setSelectedVariant(null); setIsFormOpen(true); }} className="flex items-center justify-center w-full md:w-auto px-4 py-3 md:py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-5 h-5 mr-2" /> Agregar Variante / Talla
          </button>
        )}
      </div>

      {isAdmin && (
        <VariantKPIs 
          total={variants.length} 
          alertas={variants.filter(v => v.estado && v.stockActual <= v.stockMinimo).length}
          packs={variants.filter(v => v.estado && v.presentaciones && v.presentaciones.length > 0).length}
          valorTotal={totalValor} 
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        
        <VariantFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} statusFilter={statusFilter} onStatusChange={setStatusFilter} packFilter={packFilter} onPackChange={setPackFilter} sortBy={sortBy} onSortChange={setSortBy} />

        {/* VISTA MÓVIL (TARJETAS DESACOPLADAS) */}
        <VariantMobileCards 
          variants={processedVariants}
          isAdmin={isAdmin}
          formatAtributos={formatAtributos}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleClick}
          onDelete={handleDeleteClick}
          onImageZoom={handleImageZoomClick}
        />

        {/* VISTA ESCRITORIO (TABLA DESACOPLADA) */}
        <VariantTable 
          variants={processedVariants}
          isAdmin={isAdmin}
          formatAtributos={formatAtributos}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleClick}
          onDelete={handleDeleteClick}
          onImageZoom={handleImageZoomClick}
        />
      </div>

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmAction} title={actionType === 'delete' ? 'Eliminar Variante' : 'Cambiar Estado'} message={actionType === 'delete' ? '¿Eliminar permanentemente esta variante de inventario?' : '¿Deseas cambiar el estado de este registro?'} confirmText={actionType === 'delete' ? 'Eliminar' : 'Confirmar'} isDestructive={actionType === 'delete' || (selectedVariant?.estado ?? false)} />

      {/* VISOR OVERLAY INTERACTIVO PARA LA FOTO (DESACOPLADO) */}
      <VariantImageOverlay 
        isOpen={zoomedImage !== null}
        imageUrl={zoomedImage?.url ?? null}
        sku={zoomedImage?.title ?? ''}
        onClose={() => setZoomedImage(null)}
      />

    </div>
  );
};