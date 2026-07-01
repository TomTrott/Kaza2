import type { Metadata } from "next";
import RegisterPageClient from "@/components/pages/register/Register";

export const metadata: Metadata = {
  title: "Inscription | Kasa",
  description:
    "Créez votre compte Kasa pour réserver des logements uniques et partager vos propres hébergements.",
};

export default function Page() {
  return <RegisterPageClient />;
}