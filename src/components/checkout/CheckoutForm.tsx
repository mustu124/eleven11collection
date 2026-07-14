"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart-context";
import { buildOrderMessage, getWhatsAppCheckoutUrl } from "@/lib/whatsapp";
import { calculateShippingFee, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackButton } from "@/components/ui/BackButton";

type Fields = { name: string; address: string; pincode: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.address.trim()) errors.address = "Address is required.";
  if (!fields.pincode.trim()) errors.pincode = "Pincode is required.";
  else if (!/^\d{6}$/.test(fields.pincode.trim()))
    errors.pincode = "Pincode must be exactly 6 digits.";
  return errors;
}

export function CheckoutForm({ whatsappNumber }: { whatsappNumber: string }) {
  const cart = useCart();
  const [fields, setFields] = useState<Fields>({
    name: "",
    address: "",
    pincode: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState<string | null>(null);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = calculateShippingFee(subtotal);
  const total = subtotal + shippingFee;

  function updateField(name: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [name]: value }));
    setFieldErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (cart.items.length === 0) {
      setGeneralError("Your cart is empty.");
      return;
    }

    const errors = validate(fields);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setGeneralError(null);
    setSubmitting(true);

    // Open a blank tab synchronously, directly inside this click handler —
    // browsers allow window.open() called synchronously on a user gesture,
    // but commonly block it once called after an `await` (the gesture
    // context has expired by then). We redirect this already-open tab to
    // the real wa.me URL once the order save resolves below.
    const waWindow = window.open("", "_blank");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fields.name,
          address: fields.address,
          pincode: fields.pincode,
          cartItems: cart.items,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error ?? "Could not place your order. Please try again.");
        waWindow?.close();
        return;
      }

      const ref = `#${String(data.orderId).slice(0, 8).toUpperCase()}`;
      const message = buildOrderMessage({
        orderRef: ref,
        customerName: fields.name,
        address: fields.address,
        pincode: fields.pincode,
        items: cart.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, slug: i.slug ?? null })),
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        total: data.total,
      });
      const url = getWhatsAppCheckoutUrl(message, whatsappNumber);
      setOrderRef(ref);
      setWaUrl(url);

      if (waWindow && !waWindow.closed) {
        // Redirect succeeded (not blocked) — safe to clear the cart now.
        waWindow.location.href = url;
        cart.clear();
        setSuccess(true);
      } else {
        // Blocked even for the synchronous open. Don't clear the cart —
        // wait for the user's own click on the fallback link below, which
        // is itself a direct user gesture and can't be blocked.
        setPopupBlocked(true);
      }
    } catch {
      setGeneralError("Something went wrong. Please check your connection and try again.");
      waWindow?.close();
    } finally {
      setSubmitting(false);
    }
  }

  function handleFallbackLinkClick() {
    cart.clear();
    setSuccess(true);
    setPopupBlocked(false);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-ink">Order placed</h1>
        <p className="mt-2 font-sans text-sm text-ink-soft">
          Eleven11 Collection Order {orderRef} — we&apos;ve opened WhatsApp with your order
          details. Send the message to confirm.
        </p>
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block font-sans text-sm text-gold-dark underline"
          >
            WhatsApp didn&apos;t open? Tap here
          </a>
        )}
        <div className="mt-6">
          <Link href="/" className="font-sans text-sm text-ink-soft underline hover:text-gold">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (popupBlocked && waUrl) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-ink">Almost there</h1>
        <p className="mt-2 font-sans text-sm text-ink-soft">
          Your order {orderRef} was saved. Your browser blocked the automatic WhatsApp
          pop-up — tap below to continue.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          onClick={handleFallbackLinkClick}
          className="mt-6 inline-block rounded-full bg-gold-dark px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-4 md:px-8">
        <BackButton />
        <EmptyState
          title="Your cart is empty"
          description="Add something you love before checking out."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-6 md:grid-cols-2 md:px-8 md:py-10">
      <div>
        <BackButton className="mb-4" />
        <h1 className="mb-4 font-serif text-2xl text-ink">Checkout</h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={fields.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className="w-full min-h-11 rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {fieldErrors.name && (
              <p id="name-error" role="alert" className="mt-1 font-sans text-xs text-red-600">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Delivery Address
            </label>
            <textarea
              id="address"
              rows={3}
              value={fields.address}
              onChange={(e) => updateField("address", e.target.value)}
              aria-invalid={!!fieldErrors.address}
              aria-describedby={fieldErrors.address ? "address-error" : undefined}
              className="w-full min-h-11 rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {fieldErrors.address && (
              <p id="address-error" role="alert" className="mt-1 font-sans text-xs text-red-600">
                {fieldErrors.address}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pincode" className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Pincode
            </label>
            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              value={fields.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              aria-invalid={!!fieldErrors.pincode}
              aria-describedby={fieldErrors.pincode ? "pincode-error" : undefined}
              placeholder="6-digit pincode"
              className="w-full min-h-11 rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {fieldErrors.pincode && (
              <p id="pincode-error" role="alert" className="mt-1 font-sans text-xs text-red-600">
                {fieldErrors.pincode}
              </p>
            )}
          </div>

          {generalError && (
            <p role="alert" className="font-sans text-sm text-red-600">
              {generalError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 w-full rounded-full bg-gold-dark px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing order..." : "Checkout on WhatsApp"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg text-ink">Order Summary</h2>
        <ul className="space-y-3 border-b border-ink/10 pb-4">
          {cart.items.map((item) => (
            <li
              key={`${item.productId}:${item.variantId ?? ""}`}
              className="flex justify-between font-sans text-sm text-ink"
            >
              <span>
                {item.name} × {item.qty}
              </span>
              <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between font-sans text-sm text-ink-soft">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between font-sans text-sm text-ink-soft">
            <span>Shipping</span>
            <span className={shippingFee === 0 ? "text-green-700" : undefined}>
              {shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN")}`}
            </span>
          </div>
          {shippingFee > 0 && (
            <p className="font-sans text-xs text-ink-soft">
              Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more to get free shipping.
            </p>
          )}
          <div className="flex justify-between border-t border-ink/10 pt-2 font-sans text-sm font-medium text-ink">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
