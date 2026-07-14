export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <p className="font-sans text-xs uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-1 font-serif text-3xl text-ink">{value}</p>
      {sub && <p className="mt-0.5 font-sans text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
