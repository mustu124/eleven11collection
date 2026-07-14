"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveWhatsAppNumberAction } from "@/app/admin/(dashboard)/settings/actions";

export function WhatsAppNumberForm({ currentNumber }: { currentNumber: string }) {
  const router = useRouter();
  const [value, setValue] = useState(currentNumber);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.append("whatsapp_number", value);

    startTransition(async () => {
      const result = await saveWhatsAppNumberAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-sm space-y-3 rounded-lg border border-ink/10 bg-white p-4">
      <div>
        <label
          htmlFor="whatsapp_number"
          className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft"
        >
          WhatsApp Number
        </label>
        <div className="flex items-center gap-2">
          <span className="flex min-h-11 items-center rounded-md border border-ink/15 bg-ivory-soft px-3 font-sans text-sm text-ink-soft">
            +91
          </span>
          <input
            id="whatsapp_number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            className="w-full min-h-11 rounded-md border border-ink/15 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <p className="mt-1 font-sans text-xs text-ink-soft">
          Orders placed at checkout, and the number shown on the Contact page, go to this number.
        </p>
      </div>

      {error && (
        <p role="alert" className="font-sans text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="font-sans text-sm text-green-700">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-gold-dark px-5 py-2 font-sans text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
