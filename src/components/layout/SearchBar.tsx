"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full ${className}`}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 h-4 w-4 text-ink-soft"
      />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for earrings, rings, kadas..."
        aria-label="Search products"
        className="min-h-11 w-full rounded-full border border-ink/10 bg-white/70 py-2 pl-9 pr-4 text-sm font-sans text-ink placeholder:text-ink-soft focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </form>
  );
}
