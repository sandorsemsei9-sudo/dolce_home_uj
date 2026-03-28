import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  quantity: number;
  isCustom?: boolean;
};

// Itt definiáljuk a kupon típusát
export type AppliedCoupon = {
  code: string;
  discountValue: number;
} | null;

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon; // ÚJ
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCoupon: (coupon: AppliedCoupon) => void; // ÚJ
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null, // Alapértelmezett érték

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.id === newItem.id && item.size === newItem.size && !newItem.isCustom
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

      setCoupon: (coupon) => set({ appliedCoupon: coupon }), // ÚJ függvény

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);