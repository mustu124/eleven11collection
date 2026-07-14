import { SearchClient } from "@/components/search/SearchClient";

export const metadata = { title: "Search" };

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <SearchClient initialQuery={searchParams.q ?? ""} />;
}
