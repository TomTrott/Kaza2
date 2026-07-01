"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function LoginPageClient() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/login", {
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
        } catch {
            alert("Email ou mot de passe incorrect");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F6F3F2] px-4">
            <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-12">
                <div className="max-w-md mx-auto">
                    <h1 className="text-5xl font-bold text-[#A63D1B] mb-4">
                        Heureux de vous revoir
                    </h1>

                    <p className="text-gray-600 mb-10 leading-relaxed">
                        Connectez-vous pour retrouver vos réservations,
                        vos annonces et tout ce qui rend vos séjours
                        uniques.
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-6">
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

                        <div className="mb-8">
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

                        <button
                            type="submit"
                            className="w-full bg-[#A63D1B] hover:bg-[#8e3215] text-white py-3 rounded-lg transition"
                        >
                            Se connecter
                        </button>
                    </form>

                    <div className="text-center mt-6 space-y-4">
                        <button
                            onClick={() =>
                                router.push("/forgot-password")
                            }
                            className="text-[#A63D1B] hover:underline text-sm"
                        >
                            Mot de passe oublié
                        </button>

                        <div>
                            <button
                                onClick={() =>
                                    router.push("/register")
                                }
                                className="text-[#A63D1B] hover:underline"
                            >
                                Pas encore de compte ? Inscrivez-vous
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}