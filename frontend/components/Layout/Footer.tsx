import Image from "next/image";
import MobileLogo from "@/assets/images/Logo-mobile.webp";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white border-gray-100 px-8 py-4 flex items-center justify-between">
      <Image
        src={MobileLogo}
        alt="Kasa logo"
        width={40}
        height={40}
      />
      <p className="text-sm text-gray-800">
        © 2025 Kasa. All rights reserved
      </p>
    </footer>
  );
}