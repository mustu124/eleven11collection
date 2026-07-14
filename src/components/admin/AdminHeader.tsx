"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/homepage", label: "Homepage" },
];

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-serif text-lg text-ink">ELEVEN11 COLLECTION</span>
          <span className="ml-2 font-sans text-xs uppercase tracking-wide text-gold">Admin</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex min-h-11 items-center font-sans text-sm text-ink-soft hover:text-gold disabled:opacity-60"
        >
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
      {/* Own row + horizontal scroll (not wrap) so this can never force the
          page wider than the viewport, regardless of how many links exist
          or how narrow the screen is. */}
      <nav
        aria-label="Admin"
        className="no-scrollbar flex items-center gap-5 overflow-x-auto border-t border-ink/5 px-4 pb-3 pt-1 md:px-8"
      >
        {NAV_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-11 shrink-0 items-center font-sans text-sm ${
                active ? "text-gold-dark" : "text-ink-soft hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
