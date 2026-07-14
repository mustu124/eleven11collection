"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import type { NavCategory } from "@/lib/supabase/queries";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { IconBadge } from "./IconBadge";

export function Header({ categories }: { categories: NavCategory[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount, open: openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  // The /search page has its own dedicated, URL-synced search input — showing
  // the header's search bar there too just stacks two out-of-sync search boxes.
  const isSearchPage = usePathname() === "/search";

  return (
    <header className="sticky top-0 z-30 bg-ivory">
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo className="md:mr-6" />

        {!isSearchPage && <SearchBar className="mx-auto hidden max-w-md md:flex" />}

        <div className="ml-auto flex items-center">
          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            <IconBadge count={wishlistCount} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <IconBadge count={cartCount} />
          </button>
        </div>
      </div>

      {!isSearchPage && (
        <div className="px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      )}

      <DesktopNav categories={categories} />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
    </header>
  );
}
