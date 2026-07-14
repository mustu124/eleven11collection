import Link from "next/link";
import Image from "next/image";

const FOOTER_COLUMNS = [
  {
    heading: "Help",
    links: [{ label: "Contact Us", href: "/contact" }],
  },
  {
    heading: "About",
    links: [{ label: "Our Story", href: "/about" }],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ivory-soft pb-20 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-8">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-serif text-xl tracking-[0.15em] text-ink">
              ELEVEN11 <span className="text-gold">COLLECTION</span>
            </span>
          </div>
          <p className="mt-2 max-w-xs font-sans text-sm text-ink-soft">
            Fine jewellery, thoughtfully made. Earrings, rings, kadas and more —
            crafted to be worn every day.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="font-sans text-xs uppercase tracking-wider text-ink">
              {column.heading}
            </h3>
            <ul className="mt-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center font-sans text-sm text-ink-soft hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-ink/10 px-4 pt-6 md:px-8">
        <p className="font-sans text-xs text-ink-soft">
          &copy; {new Date().getFullYear()} Eleven11 Collection. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
