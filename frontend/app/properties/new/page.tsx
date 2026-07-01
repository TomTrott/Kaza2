import type { Metadata } from "next";
import NewPropertyPage from "@/components/pages/addproperties/AddProperties";

export const metadata: Metadata = {
  title: "Nouvelle Propriété | Kasa",
  description:
    "Ajoutez votre nouveau logement à la liste des propriétés disponibles sur Kasa.",
};

export default function Page() {
  return <NewPropertyPage />;
}