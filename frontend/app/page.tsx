import type { Metadata } from "next";
import HomeClient from "@/components/pages/home/Home";

export const metadata: Metadata = {
  title: "Accueil | Kasa",
  description:
    "Découvrez des hébergements uniques partout en France avec Kasa.",
};

export default function Page() {
  return <HomeClient />;
}