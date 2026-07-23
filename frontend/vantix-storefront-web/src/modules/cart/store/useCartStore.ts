import { create } from "zustand";
import { persist } from "zustand/middleware";

// Estrutura estándar del producto guardado dentro del carrito
export interface CartProduct {
  id: number | string;
  productoId?: number;
  productoNombre: string;
  marcaNombre?: string | null;
  precioVenta: number;
  precioOferta?: number | null;
  imagenUrl?: string | null;
  stockActual?: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.product.id === product.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingIndex].quantity += 1;
          set({ items: updatedItems, isOpen: true });
        } else {
          set({ items: [...currentItems, { product, quantity: 1 }], isOpen: true });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = get().items.map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const precio = item.product.precioOferta ?? item.product.precioVenta;
          return total + precio * item.quantity;
        }, 0);
      },
    }),
    {
      name: "zarely_cart_storage", // Clave en localStorage
    }
  )
);