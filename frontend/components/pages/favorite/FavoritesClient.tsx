"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import PropertyCard from "@/components/Property/PropertyCard";

export default function FavoritesClient() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const loadFavorites = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!user) {
        setFavorites([]);
        return;
      }
      // setLoading(true);
      const res = await api.get(
        `/api/users/${user.id}/favorites`
      );

      setFavorites(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    const refresh = () => loadFavorites();

    window.addEventListener(
      "favorites-changed",
      refresh
    );
// Cleanup the event listener when the component unmounts
    return () =>
      window.removeEventListener(
        "favorites-changed",
        refresh
      );
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14">
      <div className="text-center mb-12">
        <h1 className="text-[#9F3A1D] text-3xl md:text-5xl font-semibold">
          Vos favoris
        </h1>

        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Retrouvez ici tous les logements que vous
          avez aimés. Prêts à réserver ? Un simple
          clic et votre prochain séjour est en route.
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
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {favorites.map((property: any) => (
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