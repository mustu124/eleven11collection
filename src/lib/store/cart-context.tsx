"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  updatePrice: (productId: string, variantId: string | null, price: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const STORAGE_KEY = "eleven11_cart";
const EMPTY_STATE: CartState = { items: [] };

const CartContext = createContext<CartContextValue | null>(null);

function readStoredState(): CartState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY_STATE);

  // Hydrate from localStorage after mount (avoids SSR/client hydration mismatch).
  useEffect(() => {
    setState(readStoredState());
  }, []);

  // Stay in sync across tabs, and let external scripts/devtools update the
  // cart by writing to localStorage and dispatching a `storage` event.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setState(readStoredState());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: CartState) => {
    setState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      const current = readStoredState();
      const existing = current.items.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      const items = existing
        ? current.items.map((i) =>
            i === existing ? { ...i, qty: i.qty + qty } : i
          )
        : [...current.items, { ...item, qty }];
      persist({ items });
    },
    [persist]
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null) => {
      const current = readStoredState();
      persist({
        items: current.items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        ),
      });
    },
    [persist]
  );

  const setQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      const current = readStoredState();
      persist({
        items:
          qty <= 0
            ? current.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
              )
            : current.items.map((i) =>
                i.productId === productId && i.variantId === variantId
                  ? { ...i, qty }
                  : i
              ),
      });
    },
    [persist]
  );

  const updatePrice = useCallback(
    (productId: string, variantId: string | null, price: number) => {
      const current = readStoredState();
      const item = current.items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (!item || item.price === price) return;
      persist({
        items: current.items.map((i) => (i === item ? { ...i, price } : i)),
      });
    },
    [persist]
  );

  const clear = useCallback(() => persist(EMPTY_STATE), [persist]);

  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const count = useMemo(
    () => state.items.reduce((sum, i) => sum + i.qty, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      count,
      addItem,
      removeItem,
      setQty,
      updatePrice,
      clear,
      isOpen,
      open,
      close,
      toggle,
    }),
    [state.items, count, addItem, removeItem, setQty, updatePrice, clear, isOpen, open, close, toggle]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
