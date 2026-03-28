import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Kibővített CartItem típus
export type CartItem = {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string; // Ez a vágott preview URL-je
  quantity: number;
  isCustom?: boolean;
  // ÚJ MEZŐ: Az egyedi rendelés extra adatai
  customData?: {
    original_image_url: string;
    ratio: string;
    config: {
      zoom: number;
      crop: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  };
};

export type AppliedCoupon = {
  code: string;
  discountValue: number;
} | null;

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCoupon: (coupon: AppliedCoupon) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (newItem) => {
        const currentItems = get().items;
        
        // MÓDOSÍTOTT LOGIKA: 
        // Ha egyedi termékről van szó (isCustom), soha ne vonja össze egy meglévővel, 
        // mert minden egyedi kép más és más!
        const existingItem = newItem.isCustom 
          ? null 
          : currentItems.find(
              (item) => item.id === newItem.id && item.size === newItem.size && !item.isCustom
            );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === newItem.id && item.size === newItem.size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      
      updateQuantity: (id, qty) => set({
        items: get().items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)
      }),

      setCoupon: (coupon) => set({ appliedCoupon: coupon }),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalPrice: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = get().appliedCoupon?.discountValue || 0;
        return Math.max(0, subtotal - discount);
      },
    }),
    { name: 'cart-storage' }
  )
);