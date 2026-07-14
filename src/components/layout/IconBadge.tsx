export function IconBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      data-testid="icon-badge"
      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-dark px-1 text-[10px] font-sans font-medium leading-none text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
