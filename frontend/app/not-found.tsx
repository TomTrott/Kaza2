import Link from "next/link";


export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl md:text-8xl font-extrabold text-[#9F3A1D] tracking-tight mb-6">
        404
      </h1>

      <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
        Il semble que la page que vous cherchez ait pris des vacances...
        ou n&apos;ait jamais existé.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <Link
          href="/"
          className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 text-center text-sm font-medium hover:opacity-90 transition"
        >
          Accueil
        </Link>
        <Link
          href="/"
          className="w-full bg-[#9F3A1D] text-white rounded-xl py-3 text-center text-sm font-medium hover:opacity-90 transition"
        >
          Logements
        </Link>
      </div>
    </main>
  );
}