"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Back", className = "" }: { label?: string; className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`flex min-h-11 items-center gap-1.5 font-sans text-sm text-ink-soft hover:text-gold ${className}`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
