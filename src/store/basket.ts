'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import {
  getMenuItem3dImage,
  getMenuItemById,
  getMenuItemRealPhoto,
} from '@/data/menu';
import { computePizzetaPromo, type PizzetaPromo } from '@/lib/promo';
import { trackEvent } from '@/lib/analytics';

export interface BasketItem {
  id: string;
  size?: string;
  qty: number;
  /** Optional 3 pizza IDs chosen for the Pack Degustación Familiar */
  packPizzas?: string[];
}

export interface EnrichedBasketItem extends BasketItem {
  lineKey: string;
  name: { es: string; ca: string };
  sizeLabel?: { es: string; ca: string };
  unitPriceCents: number;
  lineTotalCents: number;
  image: string;
}

export interface AddItemOptions {
  packPizzas?: string[];
}

export function getBasketLineKey(item: {
  id: string;
  size?: string;
  packPizzas?: string[];
}): string {
  const packKey = item.packPizzas && item.packPizzas.length > 0 ? item.packPizzas.join('+') : '';
  return `${item.id}__${item.size ?? 'default'}__${packKey}`;
}

interface BasketState {
  items: BasketItem[];
  notes: string;
  isOpen: boolean;
  lastAnnouncement: string;
  openDrawer: () => void;
  closeDrawer: () => void;
  setNotes: (notes: string) => void;
  addItem: (id: string, size?: string, qty?: number, options?: AddItemOptions) => void;
  setItemQty: (id: string, size: string | undefined, qty: number, lineKey?: string) => void;
  removeItem: (id: string, size?: string, lineKey?: string) => void;
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

      addItem: (id: string, size?: string, qty = 1, options?: AddItemOptions) => {
        if (qty <= 0) return;
        const menuItem = getMenuItemById(id);
        if (!menuItem) return;

        const resolvedSize = size ?? menuItem.sizes?.[0]?.id;
        const normalizedPack =
          options?.packPizzas && options.packPizzas.length > 0
            ? [...options.packPizzas]
            : undefined;

        const targetKey = getBasketLineKey({
          id,
          size: resolvedSize,
          packPizzas: normalizedPack,
        });

        trackEvent('add_to_basket', { id, size: resolvedSize, qty });

        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => getBasketLineKey(i) === targetKey
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
            nextItems.push({
              id,
              size: resolvedSize,
              qty,
              ...(normalizedPack ? { packPizzas: normalizedPack } : {}),
            });
          }

          return {
            items: nextItems,
            lastAnnouncement: `${menuItem.name.es} (${qty})`,
          };
        });
      },

      setItemQty: (id: string, size: string | undefined, qty: number, lineKey?: string) => {
        set((state) => {
          const matchLine = (i: BasketItem) =>
            lineKey ? getBasketLineKey(i) === lineKey : i.id === id && i.size === size;

          if (qty <= 0) {
            return {
              items: state.items.filter((i) => !matchLine(i)),
            };
          }
          return {
            items: state.items.map((i) => (matchLine(i) ? { ...i, qty } : i)),
          };
        });
      },

      removeItem: (id: string, size?: string, lineKey?: string) => {
        set((state) => ({
          items: state.items.filter((i) =>
            lineKey ? getBasketLineKey(i) !== lineKey : !(i.id === id && i.size === size)
          ),
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

function shortPizzaTitle(title: string): string {
  return title.replace(/^Pizza\s+/i, '');
}

/**
 * Pure selector that computes enriched line items and totals in integer cents.
 * `totalCents` is what the customer pays: the sum of the lines minus the
 * pizzeta promotion.
 */
export function getEnrichedBasket(items: BasketItem[]): {
  enrichedItems: EnrichedBasketItem[];
  subtotalCents: number;
  promo: PizzetaPromo;
  totalCents: number;
  totalCount: number;
} {
  const enrichedItems: EnrichedBasketItem[] = [];
  let subtotalCents = 0;
  let totalCount = 0;

  for (const line of items) {
    if (line.qty <= 0) continue;
    const menuItem = getMenuItemById(line.id);
    if (!menuItem) continue;

    const sizeOption = line.size
      ? menuItem.sizes?.find((s) => s.id === line.size)
      : menuItem.sizes?.[0];

    let packLabelEs = '';
    let packLabelCa = '';
    if (line.packPizzas && line.packPizzas.length > 0) {
      const namesEs: string[] = [];
      const namesCa: string[] = [];
      line.packPizzas.forEach((pId, idx) => {
        const pItem = getMenuItemById(pId);
        if (pItem) {
          namesEs.push(`${idx + 1}: ${shortPizzaTitle(pItem.name.es)}`);
          namesCa.push(`${idx + 1}: ${shortPizzaTitle(pItem.name.ca)}`);
        }
      });
      packLabelEs = namesEs.join(' · ');
      packLabelCa = namesCa.join(' · ');
    }

    const baseSizeEs = sizeOption?.label.es ?? '';
    const baseSizeCa = sizeOption?.label.ca ?? '';

    const partsEs = [baseSizeEs, packLabelEs].filter(Boolean);
    const partsCa = [baseSizeCa, packLabelCa].filter(Boolean);

    const combinedSizeLabel =
      partsEs.length > 0
        ? {
            es: partsEs.join(' · '),
            ca: partsCa.join(' · '),
          }
        : undefined;

    const unitPriceCents = sizeOption ? sizeOption.priceCents : menuItem.priceCents;
    const lineTotalCents = unitPriceCents * line.qty;

    subtotalCents += lineTotalCents;
    totalCount += line.qty;

    const resolvedLine = {
      id: line.id,
      size: sizeOption?.id ?? line.size,
      qty: line.qty,
      ...(line.packPizzas ? { packPizzas: line.packPizzas } : {}),
    };

    enrichedItems.push({
      ...resolvedLine,
      lineKey: getBasketLineKey(resolvedLine),
      name: menuItem.name,
      sizeLabel: combinedSizeLabel,
      unitPriceCents,
      lineTotalCents,
      image: getMenuItemRealPhoto(menuItem) ?? getMenuItem3dImage(menuItem) ?? menuItem.image,
    });
  }

  const promo = computePizzetaPromo(
    enrichedItems.map((line) => ({
      id: line.id,
      size: line.size,
      qty: line.qty,
      unitPriceCents: line.unitPriceCents,
    }))
  );

  return {
    enrichedItems,
    subtotalCents,
    promo,
    totalCents: subtotalCents - promo.discountCents,
    totalCount,
  };
}
