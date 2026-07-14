"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import type { NavCategory } from "@/lib/supabase/queries";

const FOOTER_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Offer Zone", href: "/offers" },
];

export function MobileMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
}) {
  const panelRef = useFocusTrap(open, onClose);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect (not useEffect) so `inert` clears before useFocusTrap's
  // own useEffect tries to move focus into the panel — otherwise the panel
  // is still inert when that focus() call runs and the browser drops it.
  // Set the `inert` IDL property directly via ref rather than as a JSX prop
  // — React 18's JSX attribute handling doesn't reliably reflect `inert`
  // (it only became a first-class React prop in React 19). When closed,
  // the panel is still in the DOM (for the slide-out transition); `inert`
  // removes its links/buttons from the tab order and AT tree so
  // aria-hidden isn't left on focusable descendants.
  useLayoutEffect(() => {
    if (wrapperRef.current) wrapperRef.current.inert = !open;
  }, [open]);

  return (
    <div
      id="mobile-menu"
      ref={wrapperRef}
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`absolute left-0 top-0 h-full w-[82%] max-w-xs overflow-y-auto bg-ivory shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <span className="font-serif text-lg tracking-wide text-ink">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Categories" className="px-5 py-4">
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="flex min-h-11 items-center font-sans text-sm uppercase tracking-wider text-ink/80 hover:text-gold"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-ink/10 px-5 py-4">
          <ul>
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex min-h-11 items-center font-sans text-sm text-ink-soft hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
