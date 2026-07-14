import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex min-h-11 shrink-0 items-center gap-1.5 px-2 ${className}`}
    >
      <Image
        src="/logo-mark.png"
        alt="Eleven11 Collection"
        width={40}
        height={40}
        priority
        className="h-8 w-8 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10"
      />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-base tracking-[0.08em] text-ink sm:text-xl md:text-2xl sm:tracking-[0.15em]">
          ELEVEN11
        </span>
        <span className="mt-0.5 text-[7px] tracking-[0.2em] text-gold font-sans sm:text-[10px] sm:tracking-[0.35em]">
          COLLECTION
        </span>
      </span>
    </Link>
  );
}
