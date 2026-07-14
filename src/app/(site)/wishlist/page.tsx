import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved pieces at Eleven11 Collection.",
};

export default function WishlistPage() {
  return <WishlistView />;
}
