"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-mark.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto mb-2 h-14 w-14 object-contain"
          />
          <p className="font-serif text-2xl tracking-[0.15em] text-ink">ELEVEN11 COLLECTION</p>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.3em] text-gold">Admin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {error && (
            <p role="alert" className="font-sans text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-gold-dark px-6 py-2.5 font-sans text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
