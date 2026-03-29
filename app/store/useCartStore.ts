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
  customData?: {
    original_image_url: string;
    ratio: string;
    config: {
      zoom: number;
      crop: { x: number; y: number; width: number; height: number; };
    };
  };
};

export type AppliedCoupon = {
  code: string;
  discountValue: number; // Ez mostantól SZÁZALÉKOT jelent (pl. 10)
} | null;

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
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

      removeItem: (id, size) => set({ 
        items: get().items.filter((i) => !(i.id === id && i.size === size)) 
      }),
      
      updateQuantity: (id, size, qty) => set({
        items: get().items.map((i) => 
          (i.id === id && i.size === size) ? { ...i, quantity: Math.max(1, qty) } : i
        )
      }),

      setCoupon: (coupon) => set({ appliedCoupon: coupon }),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalPrice: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const coupon = get().appliedCoupon;
        
        if (!coupon) return subtotal;

        // Százalékos számítás: (Összeg * 10) / 100
        const discountAmount = (subtotal * coupon.discountValue) / 100;
        return Math.max(0, Math.round(subtotal - discountAmount));
      },
    }),
    { name: 'cart-storage' }
  )
);