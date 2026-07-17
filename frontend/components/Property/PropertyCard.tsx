"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Heart } from "lucide-react";
import { fullUrl } from "@/lib/url";

interface PropertyCardProps {
    property: {
        id: number;
        title: string;
        cover: string;
        location: string;
        pricePerNight: number;
    };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Vérifie si le logement est déjà dans les favoris
  useEffect(() => {
    const loadFavorite = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get("/api/favorites");

        const exists = res.data.some(
          (fav: any) => fav.property.id === property.id
        );

        setFavorite(exists);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorite();
  }, [property.id]);


  // Ajoute ou retire le logement des favoris
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter");
      return;
    }

    const previous = favorite;

    setFavorite(!previous);

    try {
      if (previous) {
        await api.delete(`/api/favorites/${property.id}`);
      } else {
        await api.post(`/api/favorites/${property.id}`);
      }

      window.dispatchEvent(
        new Event("favorites-changed")
      );

    } catch (error) {
      console.error(error);
      setFavorite(previous);
    }
  };


  const coverUrl = !imgError
    ? fullUrl(property.cover)
    : "/property-placeholder.jpg";


  return (
    <Link href={`/properties/${property.id}`}>

      <div className="rounded-xl overflow-hidden bg-white shadow-sm relative">

        <img
          src={coverUrl}
          alt={property.title}
          width={400}
          height={440}
          onError={() => setImgError(true)}
          className="w-full h-[440px] object-cover"
        />


        {!loading && (
          <button
            onClick={toggleFavorite}
            aria-label={
              favorite
                ? "Retirer des favoris"
                : "Ajouter aux favoris"
            }
            className={
              favorite
                ? "absolute top-4 right-4 w-12 h-12 rounded-xl bg-[#9F3A1D] flex items-center justify-center"
                : "absolute top-4 right-4 w-12 h-12 rounded-xl bg-white border flex items-center justify-center"
            }
          >

            <Heart
              size={18}
              className={
                favorite
                  ? "fill-white text-white"
                  : "fill-gray-500 text-gray-500"
              }
            />

          </button>
        )}


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
              {property.pricePerNight}€
            </span>

            <span className="text-gray-500 ml-2">
              par nuit
            </span>
          </p>

        </div>

      </div>

    </Link>
  );
}