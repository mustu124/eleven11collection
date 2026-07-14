"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type WishlistState = {
  productIds: string[];
};

type WishlistContextValue = {
  productIds: string[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

const STORAGE_KEY = "eleven11_wishlist";
const EMPTY_STATE: WishlistState = { productIds: [] };

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredState(): WishlistState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.productIds) ? parsed : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WishlistState>(EMPTY_STATE);

  useEffect(() => {
    setState(readStoredState());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setState(readStoredState());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((productId: string) => {
    const current = readStoredState();
    const next = current.productIds.includes(productId)
      ? current.productIds.filter((id) => id !== productId)
      : [...current.productIds, productId];
    const nextState = { productIds: next };
    setState(nextState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, []);

  const has = useCallback(
    (productId: string) => state.productIds.includes(productId),
    [state.productIds]
  );

  const value = useMemo(
    () => ({
      productIds: state.productIds,
      count: state.productIds.length,
      has,
      toggle,
    }),
    [state.productIds, has, toggle]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
