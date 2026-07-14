"use client";

import { CartProvider } from "./cart-context";
import { WishlistProvider } from "./wishlist-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
