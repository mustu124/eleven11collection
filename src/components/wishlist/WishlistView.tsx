"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/store/wishlist-context";
import { getProductsByIds, type ProductCardData } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { BackButton } from "@/components/ui/BackButton";

export function WishlistView() {
  const wishlist = useWishlist();
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductsByIds(wishlist.productIds).then((data) => {
      if (cancelled) return;
      // Preserve wishlist order and drop any product that no longer exists
      // (e.g. removed from the catalog since it was wishlisted).
      const byId = new Map(data.map((p) => [p.id, p]));
      setProducts(wishlist.productIds.map((id) => byId.get(id)).filter((p): p is ProductCardData => !!p));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [wishlist.productIds]);

  return (
    <div className="px-4 pb-12 pt-4 md:px-8">
      <BackButton />

      <h1 className="mb-6 mt-4 text-center font-serif text-2xl text-ink">Wishlist</h1>

      {!loading && products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart on anything you love to save it here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <button
                type="button"
                onClick={() => wishlist.toggle(product.id)}
                aria-label="Remove from wishlist"
                className="absolute right-2 top-2 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-ivory/90 text-gold-dark shadow-sm hover:bg-ivory"
              >
                <Heart className="h-4 w-4 fill-gold-dark" />
              </button>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
