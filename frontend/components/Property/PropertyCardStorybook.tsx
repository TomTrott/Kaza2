"use client";

import Image from "next/image";
import { Heart } from "lucide-react";

type PropertyCardStorybookProps = {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    cover: string;
    favorite?: boolean;
  };
};

export default function PropertyCardStorybook({
  property,
}: PropertyCardStorybookProps) {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="relative">
        <Image
          src={property.cover}
          alt={property.title}
          width={400}
          height={440}
          className="w-full h-[440px] object-cover"
        />

        <button
          aria-label="Favori"
          className={
            property.favorite
              ? "absolute top-4 right-4 w-12 h-12 bg-[#9F3A1D] rounded-xl flex items-center justify-center"
              : "absolute top-4 right-4 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center"
          }
        >
          <Heart
            size={18}
            className={
              property.favorite
                ? "fill-white text-white"
                : "fill-gray-500 text-gray-500"
            }
          />
        </button>
      </div>

      <div className="p-7">
        <h2 className="text-[22px] font-medium">
          {property.title}
        </h2>

        <p className="text-gray-500">
          {property.location}
        </p>

        <div className="h-12" />

        <p>
          <span className="font-semibold">
            {property.price}€
          </span>

          <span className="text-gray-500 ml-2">
            par nuit
          </span>
        </p>
      </div>
    </div>
  );
}