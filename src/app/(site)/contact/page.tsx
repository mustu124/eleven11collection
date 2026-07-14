import type { Metadata } from "next";
import { Mail, MessageCircle, AtSign } from "lucide-react";
import { toWhatsAppNumber } from "@/lib/whatsapp";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Eleven11 Collection over WhatsApp, email, or Instagram.",
};

const EMAIL = "Eleven11collection81@gmail.com";
const INSTAGRAM_HANDLE = "eleven11_collection";

function formatIndianNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return raw;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export default function ContactPage() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const whatsappHref = `https://wa.me/${toWhatsAppNumber(rawNumber)}`;
  const displayNumber = formatIndianNumber(rawNumber);

  const links = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: displayNumber,
      href: whatsappHref,
    },
    {
      icon: Mail,
      label: "Email",
      value: EMAIL,
      href: `mailto:${EMAIL}`,
    },
    {
      icon: AtSign,
      label: "Instagram",
      value: `@${INSTAGRAM_HANDLE}`,
      href: `https://instagram.com/${INSTAGRAM_HANDLE}`,
    },
  ];

  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-4 md:px-8">
      <BackButton />

      <h1 className="mb-2 mt-4 text-center font-serif text-2xl text-ink">Contact Us</h1>
      <p className="mb-8 text-center font-sans text-sm text-ink-soft">
        We&apos;d love to hear from you — reach out any way that&apos;s easiest.
      </p>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-3 rounded-md border border-ink/10 px-4 py-3 font-sans text-sm text-ink hover:border-gold"
            >
              <link.icon className="h-5 w-5 shrink-0 text-gold-dark" aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-wide text-ink-soft">
                  {link.label}
                </span>
                {link.value}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
