"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { Heart } from "lucide-react";
import { fullUrl } from "@/lib/url";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    cover: string;
    location: string;
    price_per_night: number;
  };
  // true pour les 1-2 premières cartes au-dessus du pli (LCP)
  priority?: boolean;
}

export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
  // État pour savoir si la propriété est dans les favoris de l'utilisateur
  const [favorite, setFavorite] = useState(false);
  // État pour savoir si la requête pour récupérer le statut de favori est en cours
  const [loading, setLoading] = useState(true);
  // État pour savoir si l'image de couverture a échoué à se charger
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // Fonction pour charger le statut de favori de la propriété
    const loadFavoriteStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        // Si l'utilisateur n'est pas connecté, on ne fait rien
        if (!token || !user) {
          if (isMounted) setLoading(false);
          return;
        }
        // On récupère la liste des favoris de l'utilisateur et on vérifie si la propriété est dans cette liste
        const res = await api.get(`/api/users/${user.id}/favorites`);
        const isFavorite = res.data.some((fav: { id: string }) => fav.id === property.id);
        // On met à jour l'état favorite si le composant est toujours monté
        if (isMounted) setFavorite(isFavorite);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    // On appelle la fonction pour charger le statut de favori
    loadFavoriteStatus();
    return () => {
      isMounted = false;
    };
  }, [property.id]);
  // Fonction pour ajouter ou retirer la propriété des favoris de l'utilisateur
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // On vérifie si l'utilisateur est connecté
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter");
      return;
    }

    // optimistic update, rollback si l'appel échoue
    const previous = favorite;
    setFavorite(!previous);
    // On envoie la requête pour ajouter ou retirer la propriété des favoris
    try {
      if (previous) {
        await api.delete(`/api/properties/${property.id}/favorite`);
      } else {
        await api.post(`/api/properties/${property.id}/favorite`);
      }
      // On déclenche un événement pour informer les autres composants que la liste des favoris a changé
      window.dispatchEvent(new Event("favorites-changed"));
    } catch (error) {
      console.error(error);
      setFavorite(previous);
    }
  };
  //
  const coverUrl = !imgError ? fullUrl(property.cover) : "/property-placeholder.jpg";

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="relative bg-gray-100">
          <img
            src={coverUrl}
            alt={property.title}
            width={400}
            height={440}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-[440px] object-cover"
          />

          {!loading && (
            <button
              onClick={toggleFavorite}
              aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={favorite}
              className={
                favorite
                  ? "absolute top-4 right-4 w-12 h-12 bg-[#9F3A1D] rounded-xl flex items-center justify-center hover:opacity-90 transition"
                  : "absolute top-4 right-4 w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:opacity-90 transition"
              }
            >
              <Heart
                size={18}
                className={favorite ? "fill-white text-white" : "fill-gray-500 text-gray-500"}
              />
            </button>
          )}
        </div>

        <div className="p-7">
          <h2 className="text-[22px] font-medium">{property.title}</h2>

          <p className="text-gray-500">{property.location}</p>

          <div className="h-12" />

          <p>
            <span className="font-semibold">{property.price_per_night}€</span>
            <span className="text-gray-500 ml-2">par nuit</span>
          </p>
        </div>
      </div>
    </Link>
  );
}