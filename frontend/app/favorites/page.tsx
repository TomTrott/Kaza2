import type { Metadata } from "next";
import FavoritesClient from "@/components/pages/favorite/FavoritesClient";

export const metadata: Metadata = {
  title: "Mes Favoris | Kasa",
  description: "Gérez vos propriétés favorites sur Kasa",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}