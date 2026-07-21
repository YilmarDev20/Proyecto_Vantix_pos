import { AdvancedProductSearch } from '@/components/ui/AdvancedProductSearch';
import type { Variant } from '../../variant/types/variant.types';

interface VariantSearchProps {
  variants: Variant[];
  onAddVariant: (variant: Variant) => void;
  formatName: (v: Variant) => string;
}

export const VariantSearch = ({ variants, onAddVariant, formatName }: VariantSearchProps) => {
  return (
    <AdvancedProductSearch
      items={variants}
      onSelectItem={onAddVariant}
      customFormatName={formatName}
      placeholder="Buscar producto por nombre, marca, SKU o código..."
    />
  );
};