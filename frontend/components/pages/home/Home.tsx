"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/services/api";
import PropertyCard from "@/components/Property/PropertyCard";
import PhotoAccueil from "@/assets/images/Photo-accueil.webp";

export default function HomeClient() {
  const [properties, setProperties] = useState<any[]>([]);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const updateLimit = () => {
      setLimit(window.innerWidth < 768 ? 6 : 12);
    };
    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  useEffect(() => {
    api.get("/api/properties").then((res) => {
      setProperties(res.data);
    });
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-8 py-10">
      {/* Hero */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#9F3A1D] mb-4">
            Chez vous, partout et ailleurs
          </h1>

          <p className="text-gray-700 text-base md:text-lg">
            Avec Kasa, vivez des séjours uniques dans des hébergements
            chaleureux, sélectionnés avec soin par nos hôtes.
          </p>
        </div>

        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[450px] lg:h-[550px] overflow-hidden rounded-[24px]">
          <Image
            src={PhotoAccueil}
            alt="Maison moderne"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      {/* Propriétés */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {properties.slice(0, limit).map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>

      {/* Comment ça marche */}
      <section className="mt-24 bg-white rounded-[8px] py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[42px] font-semibold text-black mb-6">
            Comment ça marche ?
          </h2>

          <p className="text-[18px] text-[#222222] leading-relaxed">
            Que vous partiez pour un week-end improvisé, des vacances en
            famille ou un voyage professionnel,
            <br />
            Kasa vous aide à trouver un lieu qui vous ressemble.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#9C3114] rounded-xl p-8 text-white min-h-[220px]">
            <h3 className="text-[22px] font-medium mb-8">
              Recherchez
            </h3>

            <p className="text-[18px] leading-relaxed text-white/95">
              Entrez votre destination, vos dates et laissez Kasa faire le
              reste.
            </p>
          </div>

          <div className="bg-[#9C3114] rounded-xl p-8 text-white min-h-[220px]">
            <h3 className="text-[22px] font-medium mb-8">
              Réservez
            </h3>

            <p className="text-[18px] leading-relaxed text-white/95">
              Profitez d’une plateforme sécurisée et de profils d’hôtes
              vérifiés.
            </p>
          </div>

          <div className="bg-[#9C3114] rounded-xl p-8 text-white min-h-[220px]">
            <h3 className="text-[22px] font-medium mb-8">
              Vivez l’expérience
            </h3>

            <p className="text-[18px] leading-relaxed text-white/95">
              Installez-vous, profitez de votre séjour et sentez-vous chez
              vous, partout.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}