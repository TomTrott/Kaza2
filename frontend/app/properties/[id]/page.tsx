import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import PropertyDetailClient from "./PropertyDetailClient";

export const metadata: Metadata = {
  title: "Détails de la propriété | Kasa",
  description:
    "Découvrez en détails votre future logement et contactez votre hôte pour plus d'informations.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PropertyDetailClient id={id} />
  );
}