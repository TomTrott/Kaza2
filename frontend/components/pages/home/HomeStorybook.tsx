"use client";

import Image from "next/image";
import PhotoAccueil from "@/assets/images/Photo-accueil.webp";
import PropertyCardStorybook from "@/components/Property/PropertyCardStorybook";

const properties = [
  {
    id: "1",
    title: "Villa avec piscine",
    location: "Nice",
    price: 180,
    cover: "https://picsum.photos/500/700?1",
    favorite: true,
  },
  {
    id: "2",
    title: "Appartement moderne",
    location: "Paris",
    price: 120,
    cover: "https://picsum.photos/500/700?2",
    favorite: false,
  },
  {
    id: "3",
    title: "Maison en bord de mer",
    location: "Biarritz",
    price: 220,
    cover: "https://picsum.photos/500/700?3",
    favorite: true,
  },
  {
    id: "4",
    title: "Chalet de montagne",
    location: "Chamonix",
    price: 160,
    cover: "https://picsum.photos/500/700?4",
    favorite: false,
  },
  {
    id: "5",
    title: "Loft design",
    location: "Lyon",
    price: 140,
    cover: "https://picsum.photos/500/700?5",
    favorite: false,
  },
  {
    id: "6",
    title: "Studio cosy",
    location: "Bordeaux",
    price: 90,
    cover: "https://picsum.photos/500/700?6",
    favorite: true,
  },
];

export default function HomeStorybook() {
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
            alt="Accueil"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Cartes */}
      <section className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <PropertyCardStorybook
            key={property.id}
            property={property}
          />
        ))}
      </section>

      {/* Comment ça marche */}
      <section className="mt-24 bg-white rounded-[8px] py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[42px] font-semibold mb-6">
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
          {[
            {
              title: "Recherchez",
              text: "Entrez votre destination, vos dates et laissez Kasa faire le reste.",
            },
            {
              title: "Réservez",
              text: "Profitez d'une plateforme sécurisée et de profils d'hôtes vérifiés.",
            },
            {
              title: "Vivez l'expérience",
              text: "Installez-vous, profitez de votre séjour et sentez-vous chez vous, partout.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-[#9C3114] rounded-xl p-8 text-white min-h-[220px]"
            >
              <h3 className="text-[22px] font-medium mb-8">
                {step.title}
              </h3>

              <p className="text-[18px] leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}