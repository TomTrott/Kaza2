import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PropertyDetailClient from "./PropertyDetailClient";

// mock du service API pour éviter les appels réels
jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// mock du router Next.js (nécessaire car importé dans le composant)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// mock de fullUrl pour avoir des URLs prévisibles dans les tests
jest.mock("@/lib/url", () => ({
  fullUrl: (path?: string) => (path ? `https://cdn.test/${path}` : undefined),
}));

// mock de l'image statique Star.webp
jest.mock("../../../assets/images/Star.webp", () => ({
  src: "/mock-star.webp",
}));

import api from "@/services/api";

// données mockées pour les tests : 1 cover + 5 images
const mockProperty = {
  id: "123",
  title: "Charmant studio à Bordeaux",
  location: "Bordeaux, France",
  description: "Un super logement bien situé.",
  cover: "cover.jpg",
  pictures: ["pic1.jpg", "pic2.jpg", "pic3.jpg", "pic4.jpg", "pic5.jpg"],
  host: { id: "host-1", name: "Julien", picture: "host.jpg" },
};

// fonction utilitaire pour rendre le composant avec les données mockées
async function renderWithGallery(property = mockProperty) {
  (api.get as jest.Mock).mockResolvedValue({ data: property });
  render(<PropertyDetailClient id="123" />);
  await screen.findByText(property.title);
}

// ouvre la lightbox en cliquant sur l'image principale
function openLightboxOnFirstImage(title: string) {
  const mainImages = screen.getAllByAltText(title);
  fireEvent.click(mainImages[0]);
}

describe("PropertyDetailClient — Slider / Lightbox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // tests de construction de la galerie
  it("construit la galerie avec le cover en première position et la bonne URL", async () => {
    await renderWithGallery();

    // 2 versions de l'image principale (mobile + desktop)
    const mainImages = screen.getAllByAltText(mockProperty.title);
    expect(mainImages.length).toBeGreaterThan(0);

    mainImages.forEach((img) => {
      expect(img).toHaveAttribute("src", "https://cdn.test/cover.jpg");
    });
  });

  it("n'affiche que les 4 premières vignettes parmi les images additionnelles", async () => {
    await renderWithGallery();

    // On récupère toutes les images avec un alt vide (les vignettes)
    const thumbnails = screen.getAllByAltText("");
    // On vérifie qu'il y a bien 8 vignettes (4 en mobile + 4 en desktop)
    expect(thumbnails.length).toBe(8);
  });

  // tests d'ouverture de la lightbox
  it("ouvre la lightbox au clic sur l'image principale avec le compteur '1 / total'", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

 it("ouvre la lightbox sur l'image correspondante au clic sur une vignette", async () => {
  await renderWithGallery();

  // On récupère toutes les vignettes (alt="")
  const thumbnails = screen.getAllByAltText("");
  // On clique sur la 2e vignette (index 1)
  fireEvent.click(thumbnails[1]);
  // On vérifie que le compteur affiche "3 / 6" (car index + 1 dans gallery)
  expect(screen.getByText(/3 \/ 6/)).toBeInTheDocument();
});

  // tests de navigation avec les boutons
  it("passe à l'image suivante au clic sur le bouton ›", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.click(screen.getByLabelText("Image suivante"));
    expect(screen.getByText(/2 \/ 6/)).toBeInTheDocument();
  });

  it("revient à l'image précédente au clic sur le bouton ‹", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.click(screen.getByLabelText("Image suivante")); // -> 2 / 6
    fireEvent.click(screen.getByLabelText("Image précédente")); // -> 1 / 6
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

  it("boucle sur la dernière image quand on clique sur précédent depuis la première", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title); // 1 / 6
    fireEvent.click(screen.getByLabelText("Image précédente"));
    expect(screen.getByText(/6 \/ 6/)).toBeInTheDocument();
  });

  it("boucle sur la première image quand on clique sur suivant depuis la dernière", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title); // 1 / 6

    // on avance jusqu'à la dernière image (5 clics)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByLabelText("Image suivante"));
    }
    expect(screen.getByText(/6 \/ 6/)).toBeInTheDocument();

    // un clic supplémentaire boucle vers la première
    fireEvent.click(screen.getByLabelText("Image suivante"));
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

  // tests de navigation au clavier
  it("navigue avec les flèches du clavier (ArrowRight / ArrowLeft)", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText(/2 \/ 6/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

  it("ignore les touches clavier non pertinentes", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

  // tests de fermeture de la lightbox
  it("ferme la lightbox avec la touche Echap", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText(/1 \/ 6/)).not.toBeInTheDocument();
  });

  it("ferme la lightbox au clic sur le bouton de fermeture (×)", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(screen.queryByText(/1 \/ 6/)).not.toBeInTheDocument();
  });

  it("ferme la lightbox au clic sur le fond noir", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByText(/1 \/ 6/)).not.toBeInTheDocument();
  });

  it("ne ferme pas la lightbox si on clique sur l'image affichée", async () => {
    await renderWithGallery();
    openLightboxOnFirstImage(mockProperty.title);
    const allTitleImages = screen.getAllByAltText(mockProperty.title);
    const lightboxImage = allTitleImages[allTitleImages.length - 1]; // image de la lightbox
    fireEvent.click(lightboxImage);
    expect(screen.getByText(/1 \/ 6/)).toBeInTheDocument();
  });

  // cas particulier : une seule image
  it("masque les flèches de navigation s'il n'y a qu'une seule image", async () => {
    const singleImageProperty = { ...mockProperty, pictures: [] };
    await renderWithGallery(singleImageProperty);
    openLightboxOnFirstImage(mockProperty.title);
    expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Image suivante")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Image précédente")).not.toBeInTheDocument();
  });

  // test du verrouillage du scroll
  it("bloque le scroll de la page à l'ouverture et le restaure à la fermeture", async () => {
    await renderWithGallery();
    expect(document.body.style.overflow).not.toBe("hidden");
    openLightboxOnFirstImage(mockProperty.title);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(document.body.style.overflow).not.toBe("hidden");
    });
  });
});