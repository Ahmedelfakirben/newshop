import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id?: string;
}

export interface CartItem {
  product: any;
  size: any;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: any, size: any, quantity: number) => void;
  removeItem: (productId: string, sizeId: string) => void;
  updateQuantity: (productId: string, sizeId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (product, size, quantity) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size?.id === size?.id
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems, isOpen: true };
          }

          return { items: [...state.items, { product, size, quantity }], isOpen: true };
        }),
      removeItem: (productId, sizeId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.size?.id === sizeId)
          ),
        })),
      updateQuantity: (productId, sizeId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.size?.id === sizeId
              ? { ...item, quantity }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
