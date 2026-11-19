'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { getMenuItemById } from '@/data/menu';
import { trackEvent } from '@/lib/analytics';

export interface BasketItem {
  id: string;
  size?: string;
  qty: number;
}

export interface EnrichedBasketItem extends BasketItem {
  name: { es: string; ca: string };
  sizeLabel?: { es: string; ca: string };
  unitPriceCents: number;
  lineTotalCents: number;
  image: string;
}

interface BasketState {
  items: BasketItem[];
  notes: string;
  isOpen: boolean;
  lastAnnouncement: string;
  openDrawer: () => void;
  closeDrawer: () => void;
  setNotes: (notes: string) => void;
  addItem: (id: string, size?: string, qty?: number) => void;
  setItemQty: (id: string, size: string | undefined, qty: number) => void;
  removeItem: (id: string, size?: string) => void;
  clearBasket: () => void;
}

const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    } catch {
      // Ignore quota or private-browsing storage errors
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    } catch {
      // Ignore errors
    }
  },
};

export const useBasketStore = create<BasketState>()(
  persist(
    (set) => ({
      items: [],
      notes: '',
      isOpen: false,
      lastAnnouncement: '',

      openDrawer: () => {
        trackEvent('open_basket');
        set({ isOpen: true });
      },

      closeDrawer: () => set({ isOpen: false }),

      setNotes: (notes: string) => set({ notes }),

      addItem: (id: string, size?: string, qty = 1) => {
        if (qty <= 0) return;
        const menuItem = getMenuItemById(id);
        if (!menuItem) return;

        const resolvedSize = size ?? menuItem.sizes?.[0]?.id;

        trackEvent('add_to_basket', { id, size: resolvedSize, qty });

        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.id === id && i.size === resolvedSize
          );
          const nextItems = [...state.items];

          if (existingIndex >= 0) {
            const current = nextItems[existingIndex];
            if (current) {
              nextItems[existingIndex] = {
                ...current,
                qty: current.qty + qty,
              };
            }
          } else {
            nextItems.push({ id, size: resolvedSize, qty });
          }

          return {
            items: nextItems,
            lastAnnouncement: `${menuItem.name.es} (${qty})`,
          };
        });
      },

      setItemQty: (id: string, size: string | undefined, qty: number) => {
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter((i) => !(i.id === id && i.size === size)),
            };
          }
          return {
            items: state.items.map((i) =>
              i.id === id && i.size === size ? { ...i, qty } : i
            ),
          };
        });
      },

      removeItem: (id: string, size?: string) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.size === size)),
        }));
      },

      clearBasket: () => set({ items: [], notes: '' }),
    }),
    {
      name: 'la-piccerella-basket-v1',
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        items: state.items,
        notes: state.notes,
      }),
    }
  )
);

/**
 * Pure selector that computes enriched line items and total in integer cents.
 */
export function getEnrichedBasket(items: BasketItem[]): {
  enrichedItems: EnrichedBasketItem[];
  totalCents: number;
  totalCount: number;
} {
  const enrichedItems: EnrichedBasketItem[] = [];
  let totalCents = 0;
  let totalCount = 0;

  for (const line of items) {
    if (line.qty <= 0) continue;
    const menuItem = getMenuItemById(line.id);
    if (!menuItem) continue;

    const sizeOption = line.size
      ? menuItem.sizes?.find((s) => s.id === line.size)
      : menuItem.sizes?.[0];

    const unitPriceCents = sizeOption ? sizeOption.priceCents : menuItem.priceCents;
    const lineTotalCents = unitPriceCents * line.qty;

    totalCents += lineTotalCents;
    totalCount += line.qty;

    enrichedItems.push({
      id: line.id,
      size: sizeOption?.id ?? line.size,
      qty: line.qty,
      name: menuItem.name,
      sizeLabel: sizeOption?.label,
      unitPriceCents,
      lineTotalCents,
      image: menuItem.image,
    });
  }

  return { enrichedItems, totalCents, totalCount };
}
