"use client";

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import api from "@/services/api";

const equipments: string[] = [
  "Micro-Ondes", "Douche italienne", "Frigo", "WiFi", "Parking",
  "Sèche Cheveux", "Machine à laver", "Cuisine équipée", "Télévision",
  "Chambre Séparée", "Climatisation", "Frigo Américain", "Clic-clac",
  "Four", "Rangements", "Lit", "Bouilloire", "SDB", "Toilettes sèches",
  "Cintres", "Baie vitrée", "Hotte", "Baignoire", "Vue Parc",
];

const defaultTags: string[] = [
  "Parc", "Night Life", "Culture", "Nature", "Touristique",
  "Vue sur mer", "Pour les couples", "Famille", "Forêt",
];

// Libellés affichés au-dessus de la barre de progression, un par étape
const stepLabels = ["Informations", "Images", "Équipements", "Catégories"];
const TOTAL_STEPS = stepLabels.length;

// Compression image côté client avant upload
async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.7
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  // Pas besoin de recompresser un fichier déjà léger
  if (file.size < 300_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    // Redimensionnement si l'image dépasse les dimensions max
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    // Création d'un canvas pour dessiner l'image redimensionnée
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    // Conversion du canvas en blob webp
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality)
    );
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
      type: "image/webp",
    });
  } catch {
    // Si createImageBitmap/canvas échoue on garde le fichier original
    return file;
  }
}

// État de la lightbox : liste d'images affichées + index courant
type LightboxState = { images: string[]; index: number } | null;

// Aperçu plein écran d'une image, avec navigation si plusieurs images
const Lightbox = memo(function Lightbox({
  state,
  onClose,
  onPrev,
  onNext,
}: {
  state: LightboxState;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!state) return null;
  const { images, index } = state;
  const hasMultiple = images.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu de l'image en grand"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'aperçu"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Image précédente"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      )}

      <img
        src={images[index]}
        alt="Aperçu en grand"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {hasMultiple && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Image suivante"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      )}

      {hasMultiple && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
});

// Barre de progression
const ProgressBar = memo(function ProgressBar({
  step,
  onStepClick,
}: {
  step: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-between">
        {stepLabels.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onStepClick(i)}
              className="flex flex-col items-center gap-1.5 text-xs"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium transition ${
                  done
                    ? "bg-[#A54320] text-white"
                    : active
                    ? "border-2 border-[#A54320] text-[#A54320]"
                    : "border border-gray-300 text-gray-400"
                }`}
              >
                {done ? <Check size={12} aria-hidden="true" /> : i + 1}
              </span>
              <span className={active || done ? "text-gray-800" : "text-gray-400"}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {/* bar de fond + remplissage proportionnel à l'étape atteinte */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[#A54320] transition-all duration-300"
          style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
});

// Évite de re-render la grille d'équipements à chaque frappe ailleurs dans le form
const EquipmentsList = memo(function EquipmentsList({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (eq: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-y-3">
      {equipments.map((eq) => (
        <label
          key={eq}
          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.includes(eq)}
            onChange={() => onToggle(eq)}
            className="accent-[#A54320]"
          />
          {eq}
        </label>
      ))}
    </div>
  );
});

// Évite de re-render les tags à chaque frappe ailleurs dans le form
const TagsSelector = memo(function TagsSelector({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (t: string) => void;
}) {
  const customTags = selected.filter((t) => !defaultTags.includes(t));

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {customTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onToggle(tag)}
          className="rounded-lg px-3 py-1.5 text-sm transition bg-[#A54320] text-white"
        >
          {tag}
        </button>
      ))}
      {defaultTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onToggle(tag)}
          aria-pressed={selected.includes(tag)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            selected.includes(tag)
              ? "bg-[#A54320] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
});

export default function NewPropertyPage() {
  const router = useRouter();

  // Étape courante du formulaire (0 à 3)
  const [step, setStep] = useState(0);

  // Champs texte
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [location, setLocation] = useState("");
  const [hostName, setHostName] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");

  // Images
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [pictureFiles, setPictureFiles] = useState<File[]>([]);
  const [picturePreviews, setPicturePreviews] = useState<string[]>([]);
  const [hostPictureFile, setHostPictureFile] = useState<File | null>(null);
  const [hostPicturePreview, setHostPicturePreview] = useState<string>("");

  // Équipements & tags
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aperçu en grand (lightbox) — null quand fermée
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  // --- Nettoyage des object URLs pour éviter les fuites mémoire ---
  const previewsRef = useRef({ coverPreview, hostPicturePreview, picturePreviews });
  useEffect(() => {
    previewsRef.current = { coverPreview, hostPicturePreview, picturePreviews };
  }, [coverPreview, hostPicturePreview, picturePreviews]);
  useEffect(() => {
    return () => {
      const { coverPreview, hostPicturePreview, picturePreviews } = previewsRef.current;
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (hostPicturePreview) URL.revokeObjectURL(hostPicturePreview);
      picturePreviews.forEach((src) => URL.revokeObjectURL(src));
    };
  }, []);

  // Ouvre la lightbox sur une liste d'images, à un index donné
  const openLightbox = useCallback((images: string[], index: number) => {
    setLightbox({ images, index });
  }, []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const showPrevImage = useCallback(() => {
    setLightbox((prev) =>
      prev
        ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }
        : prev
    );
  }, []);
  const showNextImage = useCallback(() => {
    setLightbox((prev) =>
      prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev
    );
  }, []);

  // Navigation clavier (Échap / flèches) + on bloque le scroll de la page pendant l'aperçu
  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox, closeLightbox, showPrevImage, showNextImage]);

  // Gestion des équipements et tags sélectionnés
  const toggleEquipment = useCallback((e: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(e) ? prev.filter((i) => i !== e) : [...prev, e]
    );
  }, []);
  // Gestion des tags sélectionnés
  const toggleTag = useCallback((t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((i) => i !== t) : [...prev, t]
    );
  }, []);
  // Ajoute un tag personnalisé à la liste des tags sélectionnés
  const addCustomTag = useCallback(() => {
    setNewTag((current) => {
      if (current.trim()) {
        setSelectedTags((prev) => [...prev, current.trim()]);
      }
      return "";
    });
  }, []);

  // Upload d'une image vers l'API
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };
// Gestion de l'image de couverture (une seule)
  const handleCoverChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const compressed = await compressImage(file);
      setCoverFile(compressed);
      setCoverPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(compressed);
      });
    },
    []
  );
// Gestion des images du logement (plusieurs)
  const handlePicturesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      // Compression en parallèle de toutes les images sélectionnées
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setPictureFiles((prev) => [...prev, ...compressed]);
      setPicturePreviews((prev) => [
        ...prev,
        ...compressed.map((f) => URL.createObjectURL(f)),
      ]);
    },
    []
  );
// Supprime une image du logement à un index donné
  const removePicture = useCallback((index: number) => {
    setPictureFiles((prev) => prev.filter((_, i) => i !== index));
    setPicturePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);
// Gestion de la photo de profil de l'hôte (une seule)
  const handleHostPictureChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const compressed = await compressImage(file);
      setHostPictureFile(compressed);
      setHostPicturePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(compressed);
      });
    },
    []
  );

  // Vérifie les champs obligatoires de l'étape "Informations" avant d'avancer
  const goNext = useCallback(() => {
    if (step === 0) {
      if (!title.trim()) return setError("Le titre est obligatoire.");
      if (!pricePerNight || isNaN(Number(pricePerNight)))
        return setError("Le prix par nuit est obligatoire.");
    }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [step, title, pricePerNight]);

  const goPrev = useCallback(() => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  // Clic direct sur une pastille de la barre de progression
  const jumpToStep = useCallback((i: number) => {
    setError(null);
    setStep(i);
  }, []);

  // Soumission finale : uniquement possible depuis la dernière étape
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step !== TOTAL_STEPS - 1) return; // sécurité : le bouton submit n'existe qu'à la dernière étape
    setError(null);

    if (!title.trim()) return setError("Le titre est obligatoire.");
    if (!pricePerNight || isNaN(Number(pricePerNight)))
      return setError("Le prix par nuit est obligatoire.");

    setSubmitting(true);

    try {
      // Tous les uploads partent EN PARALLÈLE au lieu de l'un après l'autre
      const [coverUrl, pictureUrls, hostPictureUrl] = await Promise.all([
        coverFile ? uploadImage(coverFile) : Promise.resolve(undefined),
        Promise.all(pictureFiles.map((file) => uploadImage(file))),
        hostPictureFile ? uploadImage(hostPictureFile) : Promise.resolve(undefined),
      ]);
      // Construction du payload à envoyer à l'API
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        cover: coverUrl,
        location: `${postalCode} ${location}`.trim() || undefined,
        price_per_night: Number(pricePerNight),
        host: hostName.trim()
          ? { name: hostName.trim(), picture: hostPictureUrl }
          : undefined,
        pictures: pictureUrls,
        equipments: selectedEquipments,
        tags: selectedTags,
      };
      const res = await api.post("/api/properties", payload);
      router.push(`/properties/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-[#FFFBF9]">
      <main className="py-6 px-6 lg:px-0 lg:w-[65%] lg:mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Retour
        </button>

        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Ajouter une propriété</h1>

        <ProgressBar step={step} onStepClick={jumpToStep} />

        {/* On empêche la touche Entrée de soumettre le form avant la dernière étape */}
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLastStep && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          {error && (
            <div
              className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow-sm min-h-[420px]">
            {/* Étape 0 : Informations générales */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-gray-900">Informations générales</h2>
                <div>
                  <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Titre de la propriété <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex : Appartement cosy au coeur de paris"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre propriété en détail..."
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price-per-night" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Prix par nuit (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price-per-night"
                      type="number"
                      min="1"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(e.target.value)}
                      placeholder="Ex : 100"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal-code" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Code postal
                    </label>
                    <input
                      id="postal-code"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Localisation
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                  />
                </div>
              </div>
            )}

            {/* Étape 1 : Images (couverture, logement, hôte) */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-gray-900">Images</h2>

                <div>
                  <p className="mb-2 block text-sm font-medium text-gray-800">
                    Image de couverture
                  </p>
                  <div className="flex items-center gap-2">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Aperçu de l'image de couverture"
                        onClick={() => openLightbox([coverPreview], 0)}
                        className="flex-1 h-10 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition"
                      />
                    ) : (
                      <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10" />
                    )}
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} aria-hidden="true" />
                      <span className="sr-only">Ajouter une image de couverture</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-gray-800">
                    Images du logement
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10 overflow-hidden flex items-center gap-1 px-2">
                      {picturePreviews.map((src, i) => (
                        <div key={src} className="relative shrink-0">
                          <img
                            src={src}
                            alt={`Aperçu image du logement ${i + 1}`}
                            onClick={() => openLightbox(picturePreviews, i)}
                            className="h-8 w-8 rounded object-cover cursor-pointer hover:opacity-80 transition"
                          />
                          <button
                            type="button"
                            onClick={() => removePicture(i)}
                            aria-label={`Supprimer l'image ${i + 1}`}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-700 text-white rounded-full flex items-center justify-center"
                          >
                            <X size={8} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} aria-hidden="true" />
                      <span className="sr-only">Ajouter des images du logement</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePicturesChange} />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="mb-4">
                    <label htmlFor="host-name" className="mb-1.5 block text-sm font-medium text-gray-800">
                      Nom de l'hôte
                    </label>
                    <input
                      id="host-name"
                      type="text"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                    />
                  </div>

                  <p className="mb-2 block text-sm font-medium text-gray-800">Photo de profil</p>
                  <div className="flex items-center gap-2">
                    {hostPicturePreview ? (
                      <img
                        src={hostPicturePreview}
                        alt="Aperçu de la photo de profil de l'hôte"
                        onClick={() => openLightbox([hostPicturePreview], 0)}
                        className="flex-1 h-10 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition"
                      />
                    ) : (
                      <div className="flex-1 rounded-lg border border-gray-200 bg-white h-10" />
                    )}
                    <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90 shrink-0">
                      <Plus size={16} aria-hidden="true" />
                      <span className="sr-only">Ajouter une photo de profil de l'hôte</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHostPictureChange} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Équipements */}
            {step === 2 && (
              <div>
                <h2 className="mb-5 text-base font-semibold text-gray-900">Équipements</h2>
                <EquipmentsList selected={selectedEquipments} onToggle={toggleEquipment} />
              </div>
            )}

            {/* Étape 3 : Catégories / tags */}
            {step === 3 && (
              <div>
                <h2 className="mb-5 text-base font-semibold text-gray-900">Catégories</h2>
                <TagsSelector selected={selectedTags} onToggle={toggleTag} />

                <label htmlFor="new-tag" className="mb-2 block text-sm font-medium text-gray-800">
                  Ajouter une catégorie personnalisée
                </label>
                <div className="flex gap-3">
                  <input
                    id="new-tag"
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                    placeholder="Nouveau tag"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A54320]/30"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    aria-label="Ajouter le tag"
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#A54320] text-white hover:opacity-90"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation entre étapes : Précédent / Suivant, ou Ajouter sur la dernière */}
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Précédent
            </button>

            {isLastStep ? (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#A54320] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-60"
              >
                {submitting ? "Envoi..." : "Ajouter"}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-xl bg-[#A54320] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
              >
                Suivant
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </form>
      </main>

      <Lightbox
        state={lightbox}
        onClose={closeLightbox}
        onPrev={showPrevImage}
        onNext={showNextImage}
      />
    </div>
  );
}