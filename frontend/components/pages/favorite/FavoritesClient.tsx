"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import PropertyCard from "@/components/Property/PropertyCard";

export default function FavoritesClient() {

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charge les favoris de l'utilisateur connecté
  const loadFavorites = async () => {

    try {

      const token = localStorage.getItem("token");
      if (!token) {
        setFavorites([]);
        return;
      }

      const res = await api.get(
        "/api/favorites"
      );

      const properties = res.data.map(
        (favorite: any) => favorite.property
      );

      setFavorites(properties);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadFavorites();

    const refresh = () => {
      loadFavorites();
    };

    window.addEventListener(
      "favorites-changed",
      refresh
    );

    return () => {
      window.removeEventListener(
        "favorites-changed",
        refresh
      );
    };
  }, []);


  if (loading) {

    return (
      <div className="text-center mt-10">
        Chargement...
      </div>
    );

  }

  return (

    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">

        <h1 className="text-4xl font-semibold">
          Vos favoris
        </h1>

        <p className="mt-4 text-gray-500 max-w-xl mx-auto">

          Retrouvez ici tous les logements que vous
          avez aimés. Prêts à réserver ?

        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center">
          <h2 className="text-2xl font-medium">
            Aucun favori
          </h2>

          <p className="text-gray-500 mt-3">

            Ajoutez des logements à vos favoris
            pour les retrouver ici.
          </p>
        </div>
      ) : (
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">
          {favorites.map((property) => (

            <PropertyCard
              key={property.id}
              property={property}
            />
          ))}
        </div>
      )}
    </main>
  );
}