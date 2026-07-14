"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { getCurrentPrices } from "@/lib/supabase/queries";
import { calculateShippingFee, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

function lineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

export function CartDrawer() {
  const cart = useCart();
  const panelRef = useFocusTrap(cart.isOpen, cart.close);
  const [changedPrices, setChangedPrices] = useState<Set<string>>(new Set());
  const [checkingPrices, setCheckingPrices] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cart items carry the price captured at add-to-cart time (so the cart
  // works from localStorage with no network call). Reconcile against the
  // live price whenever the drawer opens: update the stored price and flag
  // the line so the change is visible, rather than silently honoring or
  // silently overwriting a stale snapshot.
  useEffect(() => {
    if (!cart.isOpen || cart.items.length === 0) {
      setChangedPrices(new Set());
      return;
    }
    let cancelled = false;
    setCheckingPrices(true);
    getCurrentPrices(
      cart.items.map((i) => ({ productId: i.productId, variantId: i.variantId }))
    ).then((current) => {
      if (cancelled) return;
      const changed = new Set<string>();
      for (const c of current) {
        const item = cart.items.find(
          (i) => i.productId === c.productId && i.variantId === c.variantId
        );
        if (item && item.price !== c.price) {
          changed.add(lineKey(c.productId, c.variantId));
          cart.updatePrice(c.productId, c.variantId, c.price);
        }
      }
      setChangedPrices(changed);
      setCheckingPrices(false);
    });
    return () => {
      cancelled = true;
    };
    // Deliberately only re-runs when the drawer opens, not on every items
    // change (which would re-trigger from our own updatePrice() call above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.isOpen]);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = calculateShippingFee(subtotal);
  const total = subtotal + shippingFee;

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${cart.isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!cart.isOpen}
    >
      <div
        onClick={cart.close}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${
          cart.isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col bg-ivory shadow-xl transition-transform duration-200 md:w-[420px] md:max-w-[90vw] ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <span className="font-serif text-lg text-ink">
            Your Cart{cart.count > 0 ? ` (${cart.count})` : ""}
          </span>
          <button
            type="button"
            onClick={cart.close}
            aria-label="Close cart"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {checkingPrices && (
            <p role="status" className="mb-3 font-sans text-xs text-ink-soft">
              Checking latest prices...
            </p>
          )}
          {cart.items.length === 0 ? (
            <p className="mt-10 text-center font-sans text-sm text-ink-soft">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-5">
              {cart.items.map((item) => {
                const key = lineKey(item.productId, item.variantId);
                return (
                  <li key={key} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-ivory-soft">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-sans text-sm text-ink">{item.name}</p>
                      <p className="font-sans text-sm text-ink">
                        ₹{item.price.toLocaleString("en-IN")}
                        {changedPrices.has(key) && (
                          <span className="ml-2 font-sans text-xs text-gold-dark">
                            Price updated
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              cart.setQty(item.productId, item.variantId, item.qty - 1)
                            }
                            className="flex min-h-11 min-w-11 items-center justify-center text-ink hover:bg-ink/5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-sans text-sm text-ink">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              cart.setQty(item.productId, item.variantId, item.qty + 1)
                            }
                            className="flex min-h-11 min-w-11 items-center justify-center text-ink hover:bg-ink/5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.productId, item.variantId)}
                          className="inline-flex min-h-11 items-center px-1 font-sans text-xs text-ink-soft underline hover:text-gold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-ink/10 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {cart.items.length > 0 && (
            <p className="mb-2 font-sans text-xs text-ink-soft">
              {shippingFee === 0
                ? "You've got free shipping!"
                : `Add ₹${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more for free shipping.`}
            </p>
          )}
          <div className="mb-3 flex items-center justify-between font-sans text-sm text-ink">
            <span>Total</span>
            <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
          </div>
          {cart.items.length === 0 ? (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-full bg-ink/15 px-6 py-3 font-sans text-sm text-ink-soft"
            >
              Checkout on WhatsApp
            </button>
          ) : (
            <Link
              href="/checkout"
              onClick={cart.close}
              className="block w-full rounded-full bg-gold-dark px-6 py-3 text-center font-sans text-sm font-medium text-white hover:opacity-90"
            >
              Checkout on WhatsApp
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
