import Image from "next/image";

import PhotoApropos from "@/assets/images/Photo-apropos.webp";
import PhotoApropos2 from "@/assets/images/Photo-apropos2.webp";

export default function AboutPageClient() {
  return (
    <main className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-[#9F3A1D] mb-6">
          À propos
        </h1>

        <p className="text-[20px] text-[#222] mb-6">
          Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où se
          sentir bien.
        </p>

        <p className="text-[20px] text-[#222] max-w-5xl mx-auto leading-relaxed">
          Depuis notre création, nous mettons en relation des voyageurs en quête
          d’authenticité avec des hôtes passionnés qui aiment partager leur
          région et leurs bonnes adresses.
        </p>
      </section>

      {/* Grande image — c'est l'élément LCP */}
      <section className="mb-16">
        <div className="relative w-full h-[520px] overflow-hidden rounded-[24px]">
          <Image
            src={PhotoApropos}
            alt="Maison Kasa"
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            quality={75}
            className="object-cover"
          />
        </div>
      </section>

      {/* Mission */}
      <section>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Texte */}
          <div>
            <h2 className="text-[38px] font-semibold text-[#9F3A1D] mb-8">
              Notre mission est simple :
            </h2>

            <ol className="space-y-8 text-[20px] text-[#222]">
              <li>1. Offrir une plateforme fiable et simple d’utilisation</li>
              <li>2. Proposer des hébergements variés et de qualité</li>
              <li>
                3. Favoriser des échanges humains et chaleureux entre hôtes et
                voyageurs
              </li>
            </ol>

            {/* Desktop */}
            <p className="hidden lg:block mt-10 text-[20px] leading-relaxed text-[#9F3A1D]">
              Que vous cherchiez un appartement cosy en centre-ville, une maison
              en bord de mer ou un chalet à la montagne, Kasa vous accompagne
              pour que chaque séjour devienne un souvenir inoubliable.
            </p>
          </div>

          {/* Image */}
          <div className="flex justify-end">
            <div className="relative w-full max-w-[520px] h-[500px] overflow-hidden rounded-[32px]">
              <Image
                src={PhotoApropos2}
                alt="Chalet"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 520px, 100vw"
                quality={75}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <p className="lg:hidden mt-8 text-[20px] leading-relaxed text-[#9F3A1D]">
          Que vous cherchiez un appartement cosy en centre-ville, une maison en
          bord de mer ou un chalet à la montagne, Kasa vous accompagne pour que
          chaque séjour devienne un souvenir inoubliable.
        </p>
      </section>
    </main>
  );
}