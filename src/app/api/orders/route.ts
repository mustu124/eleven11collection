import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

type CartItemPayload = {
  productId: unknown;
  variantId: unknown;
  name: unknown;
  price: unknown;
  qty: unknown;
  image: unknown;
};

function isValidPhone(phone: string) {
  return /^\d{10}$/.test(phone.trim());
}

function isValidPincode(pincode: string) {
  return /^\d{6}$/.test(pincode.trim());
}

export async function POST(request: NextRequest) {
  let body: {
    customerName?: unknown;
    phone?: unknown;
    address?: unknown;
    pincode?: unknown;
    cartItems?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const pincode = typeof body.pincode === "string" ? body.pincode.trim() : "";
  const cartItems = Array.isArray(body.cartItems) ? (body.cartItems as CartItemPayload[]) : null;

  if (!customerName || !phone || !address || !pincode) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Phone number must be 10 digits." }, { status: 400 });
  }
  if (!isValidPincode(pincode)) {
    return NextResponse.json({ error: "Pincode must be 6 digits." }, { status: 400 });
  }
  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Recompute the total server-side from the cart snapshot rather than
  // trusting a client-sent number.
  let total = 0;
  for (const item of cartItems) {
    if (
      typeof item.name !== "string" ||
      !item.name.trim() ||
      typeof item.price !== "number" ||
      !Number.isFinite(item.price) ||
      item.price < 0 ||
      typeof item.qty !== "number" ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
    }
    total += item.price * item.qty;
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: customerName,
      phone,
      address,
      pincode,
      cart_items: cartItems,
      total,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to save order:", error.message);
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ orderId: data.id, total });
}
