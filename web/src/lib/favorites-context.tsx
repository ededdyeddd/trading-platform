"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { WATCHLIST } from "@/lib/mock-data";

/**
 * Favorites provider — in-memory set of starred symbols.
 *
 * Seeded from `WATCHLIST[i].favorite` so the initial set matches what
 * lives in mock-data, then becomes user-mutable via `toggle(symbol)`.
 * State is intentionally not persisted (same precedent as panel sizes
 * in `page.tsx`) — refresh resets to the seeded set.
 */

type Ctx = {
  favorites: ReadonlySet<string>;
  isFavorite: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
};

const FavoritesContext = createContext<Ctx | null>(null);

function initialFavorites(): Set<string> {
  return new Set(WATCHLIST.filter((i) => i.favorite).map((i) => i.symbol));
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(initialFavorites);

  const toggle = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      favorites,
      isFavorite: (symbol) => favorites.has(symbol),
      toggle,
    }),
    [favorites, toggle]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): Ctx {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
