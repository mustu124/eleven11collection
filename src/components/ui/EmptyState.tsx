export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-2 px-4 py-20 text-center">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {description && (
        <p className="font-sans text-sm text-ink-soft">{description}</p>
      )}
    </div>
  );
}
