export type WhatsAppOrderItem = {
  name: string;
  qty: number;
  price: number;
};

export function buildOrderMessage({
  orderRef,
  customerName,
  phone,
  address,
  pincode,
  items,
  total,
}: {
  orderRef: string;
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  items: WhatsAppOrderItem[];
  total: number;
}): string {
  const itemLines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name} — Qty: ${item.qty} — ₹${item.price.toLocaleString("en-IN")} each`
  );

  return [
    "New Order — Eleven11 Collection",
    `Order Ref: ${orderRef}`,
    "",
    ...itemLines,
    "",
    `Total: ₹${total.toLocaleString("en-IN")}`,
    "",
    "Delivery Details:",
    customerName,
    address,
    `Pincode: ${pincode}`,
    `Phone: ${phone}`,
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
