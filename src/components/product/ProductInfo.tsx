"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import type { ProductDetail } from "@/lib/supabase/queries";

const LOW_STOCK_THRESHOLD = 5;

function pickDefaultVariant(variants: ProductDetail["variants"]) {
  if (variants.length === 0) return null;
  return variants.find((v) => v.stock > 0) ?? variants[0];
}

export function ProductInfo({
  product,
  image,
}: {
  product: ProductDetail;
  image: string | null;
}) {
  const cart = useCart();
  const wishlist = useWishlist();

  const [selectedVariantId, setSelectedVariantId] = useState(
    () => pickDefaultVariant(product.variants)?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setError(null);
    setJustAdded(false);
  }, [selectedVariantId, qty]);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.priceOverride ?? product.price;
  const effectiveStock = product.variants.length > 0 ? selectedVariant?.stock ?? 0 : product.stock;
  const isOutOfStock = effectiveStock <= 0;
  const isWishlisted = wishlist.has(product.id);

  function handleAddToCart() {
    if (isOutOfStock) {
      setError("This item is out of stock.");
      setJustAdded(false);
      return;
    }
    if (qty > effectiveStock) {
      setError(`Only ${effectiveStock} left in stock.`);
      setJustAdded(false);
      return;
    }
    setError(null);
    cart.addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        name: selectedVariant ? `${product.name} — ${selectedVariant.name}` : product.name,
        price: effectivePrice,
        image,
        slug: product.slug,
      },
      qty
    );
    setJustAdded(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {product.categoryName && (
        <Link
          href={`/category/${product.categorySlug}`}
          className="-my-2 flex min-h-11 w-fit items-center font-sans text-xs uppercase tracking-wider text-gold hover:underline"
        >
          {product.categoryName}
        </Link>
      )}

      <h1 className="font-serif text-2xl text-ink md:text-3xl">{product.name}</h1>

      <div className="flex items-center gap-2">
        <span className="font-sans text-xl font-medium text-ink">
          ₹{effectivePrice.toLocaleString("en-IN")}
        </span>
        {product.mrp && product.mrp > effectivePrice && (
          <span className="font-sans text-sm text-ink-soft line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isOutOfStock ? (
          <span className="rounded-full bg-ink/10 px-3 py-1 font-sans text-xs text-ink-soft">
            Out of stock
          </span>
        ) : (
          effectiveStock <= LOW_STOCK_THRESHOLD && (
            <span className="rounded-full bg-gold-dark px-3 py-1 font-sans text-xs text-white">
              Only {effectiveStock} left
            </span>
          )
        )}
        {product.badgeText && (
          <span className="rounded-full border border-gold/40 px-3 py-1 font-sans text-xs text-gold-dark">
            {product.badgeText}
          </span>
        )}
      </div>

      {product.description && (
        <p className="font-sans text-sm text-ink-soft">{product.description}</p>
      )}

      {product.variants.length > 0 && (
        <div>
          <p className="mb-2 font-sans text-xs uppercase tracking-wide text-ink-soft">
            Select size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock === 0}
                aria-pressed={v.id === selectedVariantId}
                onClick={() => setSelectedVariantId(v.id)}
                className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 font-sans text-sm transition-colors ${
                  v.id === selectedVariantId
                    ? "border-gold-dark bg-gold-dark text-white"
                    : v.stock === 0
                      ? "cursor-not-allowed border-ink/10 text-ink-soft/50 line-through"
                      : "border-ink/15 text-ink hover:border-gold"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="font-sans text-xs uppercase tracking-wide text-ink-soft">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="min-h-11 w-16 rounded-full border border-ink/15 px-3 text-center font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {error && (
        <p role="alert" className="font-sans text-sm text-red-600">
          {error}
        </p>
      )}
      {justAdded && !error && (
        <p role="status" className="font-sans text-sm text-green-700">
          Added to cart.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="min-h-11 flex-1 rounded-full bg-gold-dark px-6 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink-soft"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ink/15 text-ink hover:border-gold"
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? "fill-gold-dark text-gold-dark" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
