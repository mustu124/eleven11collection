import type { Metadata } from "next";
import { ShieldCheck, Droplet, Sparkles } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "About Us",
  description: "Premium-quality fashion jewelry, thoughtfully priced — the story behind Eleven11 Collection.",
};

const FEATURES = [
  { icon: ShieldCheck, label: "Anti-Tarnish" },
  { icon: Droplet, label: "Waterproof" },
  { icon: Sparkles, label: "Hypoallergenic" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 md:px-8">
      <BackButton />

      <h1 className="mb-6 mt-4 text-center font-serif text-2xl text-ink md:text-3xl">
        About Us
      </h1>

      <div className="space-y-5 font-sans text-sm leading-relaxed text-ink-soft md:text-base">
        <p>
          Welcome to <span className="text-ink">Eleven11 Collection</span>, your destination
          for premium-quality fashion jewelry that blends elegance, style, and everyday
          versatility.
        </p>

        <p>
          Our carefully curated collection features unique designs across every category,
          ensuring you&apos;ll find the perfect piece for every occasion — from office wear
          and college wear to party wear, wedding celebrations, and everyday essentials.
        </p>

        <ul className="flex flex-wrap justify-center gap-3 py-2">
          {FEATURES.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center gap-2 rounded-full border border-gold/30 bg-ivory-soft px-4 py-2 font-sans text-xs uppercase tracking-wide text-gold-dark"
            >
              <feature.icon className="h-4 w-4" aria-hidden="true" />
              {feature.label}
            </li>
          ))}
        </ul>

        <p>
          Every piece is anti-tarnish, waterproof, and hypoallergenic — offering lasting
          shine, comfort, and confidence for daily wear.
        </p>

        <p>
          We believe beautiful jewelry should be accessible to everyone, which is why we
          bring you premium-quality pieces at pocket-friendly prices.
        </p>

        <p>
          Whether you love minimal classics or statement designs,{" "}
          <span className="text-ink">Eleven11 Collection</span> offers timeless styles that
          help you express your individuality with confidence.
        </p>
      </div>
    </div>
  );
}
