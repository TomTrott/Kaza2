import type { Metadata } from "next";
import AboutPageClient from "@/components/pages/About";

export const metadata: Metadata = {
  title: "À propos | Kasa",
  description:
    "Découvrez l'histoire de Kasa, notre mission et nos valeurs pour vous offrir des séjours uniques partout et ailleurs.",
};

export default function Page() {
  return <AboutPageClient />;
}