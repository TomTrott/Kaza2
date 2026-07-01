"use client";

import { useState } from "react";
import Image from "next/image";
import Logo from "@/assets/images/Logo.webp";
import MobileLogo from "@/assets/images/Logo-mobile.webp";
import BurgerIcon from "@/assets/images/burger.webp";
import { Heart, MessageCircle, X } from "lucide-react";

type NavbarStorybookProps = {
  isLoggedIn?: boolean;
};

export default function NavbarStorybook({
  isLoggedIn = true,
}: NavbarStorybookProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = isLoggedIn
    ? {
        firstname: "Tom",
        role: "owner",
      }
    : null;

  const favoritesCount = 8;

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:block px-4 py-2">
        <div className="relative max-w-4xl mx-auto bg-white rounded-[20px] h-[72px] px-6 md:px-10 flex items-center justify-between mt-5">
          <div className="flex items-center gap-12">
            <button className="text-[18px] text-[#222] hover:text-[#9F3A1D]">
              Accueil
            </button>

            <button className="text-[18px] text-[#222] hover:text-[#9F3A1D]">
              À propos
            </button>
          </div>

          <button className="absolute left-1/2 -translate-x-1/2">
            <Image
              src={Logo}
              alt="Kasa"
              width={130}
              height={60}
              priority
              className="object-contain"
            />
          </button>

          <div className="flex items-center gap-4">
            {user && (user.role === "owner" || user.role === "admin") && (
              <button className="text-[#9F3A1D] text-[16px] font-medium hover:opacity-80">
                + Ajouter un logement
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3">
                <button
                  aria-label="Favoris"
                  className="flex items-center gap-1"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#9F3A1D]"
                  />

                  <span className="text-[13px] text-[#9F3A1D] font-medium">
                    {favoritesCount}
                  </span>
                </button>

                <span className="text-[#9F3A1D]/40 text-lg">|</span>

                <button aria-label="Messagerie">
                  <MessageCircle
                    size={18}
                    strokeWidth={1.5}
                    className="text-[#9F3A1D]"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile */}
      <header className="md:hidden w-full bg-white">
        <div className="flex items-center justify-between h-[72px] px-5">
          <button>
            <Image
              src={MobileLogo}
              alt="Kasa"
              width={47}
              height={47}
              priority
            />
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X size={28} />
            ) : (
              <Image
                src={BurgerIcon}
                alt="Menu"
                width={50}
                height={50}
              />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col px-5 pt-5">
            <div className="flex justify-between items-center mb-8">
              <Image
                src={MobileLogo}
                alt="Kasa"
                width={47}
                height={47}
              />

              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <nav className="flex flex-col flex-1">
              <button className="text-left text-[20px] py-6 border-b">
                Accueil
              </button>

              <button className="text-left text-[20px] py-6 border-b">
                À propos
              </button>

              {user && (
                <>
                  <button className="text-left text-[20px] py-6 border-b">
                    Messagerie
                  </button>

                  <button className="text-left text-[20px] py-6 border-b">
                    Favoris
                  </button>
                </>
              )}

              {user && (user.role === "owner" || user.role === "admin") && (
                <div className="mt-8">
                  <button className="bg-[#9F3A1D] text-white px-6 py-4 rounded-full">
                    Ajouter un logement
                  </button>
                </div>
              )}

              {user && (
                <div className="mt-auto pb-8">
                  <button className="text-red-500">
                    Déconnexion
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}