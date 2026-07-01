"use client";

import { useState } from "react";

export default function RegisterStorybook() {
  const [nom, setNom] = useState("Doe");
  const [prenom, setPrenom] = useState("John");
  const [email, setEmail] = useState("john.doe@email.com");
  const [password, setPassword] = useState("password123");
  const [accepted, setAccepted] = useState(true);

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

          <form>
            <div className="mb-5">
              <label
                htmlFor="nom"
                className="block text-sm mb-2"
              >
                Nom
              </label>

              <input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
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
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none focus:border-[#A63D1B]"
              />
            </div>

            <div className="flex items-start gap-2 mb-8 text-sm text-gray-600">
              <input
                id="accepted"
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1"
              />

              <label htmlFor="accepted">
                J'accepte les conditions générales
                d'utilisation
              </label>
            </div>

            <button
              type="button"
              className="w-full bg-[#A63D1B] hover:bg-[#8e3215] text-white py-3 rounded-lg transition"
            >
              S'inscrire
            </button>
          </form>

          <div className="text-center mt-6">
            <button className="text-[#A63D1B] hover:underline">
              Déjà membre ? Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}