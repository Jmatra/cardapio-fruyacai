/**
 * @store cartStore
 * Estado global do carrinho + modo (mesa / balcão).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, OrderMode } from "@/types";

interface CartStore {
  /* State */
  items: CartItem[];
  mode: OrderMode | null;
  mesa: number | null;
  clientName: string | null;

  /* Computed */
  totalItems: () => number;
  totalPrice: () => number;

  /* Actions */
  setMode: (mode: OrderMode, mesa?: number) => void;
  setClientName: (name: string) => void;
  addItem: (product: Product, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      mode: null,
      mesa: null,
      clientName: null,

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        ),

      setMode: (mode, mesa) => set({ mode, mesa: mesa ?? null }),

      setClientName: (clientName) => set({ clientName }),

      addItem: (product, notes) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity: 1, notes }],
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () =>
        set({ items: [], mode: null, mesa: null, clientName: null }),
    }),
    {
      name: "fruyacai-cart",
      partialize: (state) => ({
        items: state.items,
        mode: state.mode,
        mesa: state.mesa,
        clientName: state.clientName,
      }),
    }
  )
);
