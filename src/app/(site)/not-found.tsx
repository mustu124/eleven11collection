import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold">Eleven11 Collection</p>
      <h1 className="font-serif text-3xl text-ink">Page not found</h1>
      <p className="font-sans text-sm text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-gold-dark px-5 py-2 font-sans text-sm text-white hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
