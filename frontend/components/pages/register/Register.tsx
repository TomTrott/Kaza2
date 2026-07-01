"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function RegisterPageClient() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      alert("Veuillez accepter les conditions.");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: `${prenom} ${nom}`.trim(),
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      window.dispatchEvent(
        new Event("auth-changed")
      );

      router.push("/");
    } catch (error: any) {
      alert(
        error?.response?.data?.error ||
          "Erreur d'inscription"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F3F2] px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-5xl font-bold text-[#A63D1B] text-center mb-4">
            Rejoignez la communauté Kasa
          </h1>

          <p className="text-center text-gray-600 mb-10">
            Créez votre compte et commencez à voyager autrement :
            réservez des logements uniques, découvrez de
            nouvelles destinations et partagez vos propres
            lieux avec d'autres voyageurs.
          </p>

          <form onSubmit={handleRegister}>
            <div className="mb-5">
              <label
                htmlFor="nom"
                className="block text-sm mb-2"
              >
                Nom
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                value={nom}
                onChange={(e) =>
                  setNom(e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="prenom"
                className="block text-sm mb-2"
              >
                Prénom
              </label>

              <input
                id="prenom"
                name="prenom"
                type="text"
                value={prenom}
                onChange={(e) =>
                  setPrenom(e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
                required
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm mb-2"
              >
                Adresse email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm mb-2"
              >
                Mot de passe
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
                required
              />
            </div>

            <div className="flex items-start gap-2 mb-8 text-sm text-gray-600">
              <input
                id="accepted"
                name="accepted"
                type="checkbox"
                checked={accepted}
                onChange={(e) =>
                  setAccepted(e.target.checked)
                }
                className="mt-1"
              />

              <label htmlFor="accepted">
                J'accepte les conditions générales
                d'utilisation
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#A63D1B] hover:bg-[#8e3215] text-white py-3 rounded-lg transition"
            >
              S'inscrire
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[#A63D1B] hover:underline"
            >
              Déjà membre ? Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}