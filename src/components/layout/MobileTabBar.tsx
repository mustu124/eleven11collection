"use client";

import Link from "next/link";
import { Home, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { IconBadge } from "./IconBadge";

export function MobileTabBar() {
  const { count: cartCount, open: openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  const tabs = [
    { href: "/", label: "Home", Icon: Home, count: 0 },
    { href: "/search", label: "Search", Icon: Search, count: 0 },
    { href: "/wishlist", label: "Wishlist", Icon: Heart, count: wishlistCount },
    { label: "Cart", Icon: ShoppingBag, count: cartCount, onClick: openCart },
  ] as const;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-ink/10 bg-ivory py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
    >
      {tabs.map((tab) => {
        const content = (
          <>
            <span className="relative">
              <tab.Icon className="h-5 w-5" aria-hidden="true" />
              <IconBadge count={tab.count} />
            </span>
            <span className="font-sans text-[10px]">{tab.label}</span>
          </>
        );
        const className =
          "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-3 py-2 text-ink-soft hover:text-gold";

        return "onClick" in tab ? (
          <button key={tab.label} type="button" onClick={tab.onClick} className={className}>
            {content}
          </button>
        ) : (
          <Link key={tab.label} href={tab.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
