import { SITE_URL } from "./site";

export type WhatsAppOrderItem = {
  name: string;
  qty: number;
  price: number;
  // Absent for carts saved before this field existed, or for a product
  // that's since been removed from the catalog — the link line is just
  // skipped for that item rather than pointing at a dead/guessed URL.
  slug: string | null;
};

export function buildOrderMessage({
  orderRef,
  customerName,
  address,
  pincode,
  items,
  subtotal,
  shippingFee,
  total,
}: {
  orderRef: string;
  customerName: string;
  address: string;
  pincode: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}): string {
  const itemLines = items.flatMap((item, i) => {
    const lines = [
      `${i + 1}. ${item.name} — Qty: ${item.qty} — ₹${item.price.toLocaleString("en-IN")} each`,
    ];
    if (item.slug) lines.push(`   ${SITE_URL}/product/${item.slug}`);
    return lines;
  });

  return [
    "New Order — Eleven11 Collection",
    `Order Ref: ${orderRef}`,
    "",
    ...itemLines,
    "",
    `Subtotal: ₹${subtotal.toLocaleString("en-IN")}`,
    `Shipping: ${shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN")}`}`,
    `Total: ₹${total.toLocaleString("en-IN")}`,
    "",
    "Delivery Details:",
    customerName,
    address,
    `Pincode: ${pincode}`,
  ].join("\n");
}

/**
 * wa.me numbers need the full international format with no "+" and no
 * leading zero. NEXT_PUBLIC_WHATSAPP_NUMBER is stored as a plain 10-digit
 * Indian mobile number, so a bare 10-digit value is assumed to need the
 * "91" country code prefixed; anything else is passed through as-is
 * (covers the case where the env var is later set to a full
 * international number).
 */
export function toWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export function getWhatsAppCheckoutUrl(message: string): string {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const number = toWhatsAppNumber(rawNumber);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
