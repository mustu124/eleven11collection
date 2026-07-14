"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart-context";

/**
 * `/cart` is a deep-linkable URL (bookmarks, shared links), but the cart
 * itself is a drawer/sheet layered over whatever page is behind it, not a
 * standalone page. Opening this route just opens the drawer over the
 * homepage instead.
 */
export function OpenCartRedirect() {
  const cart = useCart();
  const router = useRouter();

  useEffect(() => {
    cart.open();
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
