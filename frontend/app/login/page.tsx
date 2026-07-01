import type { Metadata } from "next";
import LoginPageClient from "@/components/pages/login/Login";

export const metadata: Metadata = {
  title: "Connexion | Kasa",
  description:
    "Connectez-vous à votre compte Kasa pour gérer vos réservations, favoris et logements.",
};

export default function Page() {
  return <LoginPageClient />;
}