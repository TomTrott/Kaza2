import { render, screen, waitFor } from "@testing-library/react";
import FavoritesClient from "./FavoritesClient";
import api from "@/services/api";

// Mock du service API pour ne pas faire de vrais appels réseau
jest.mock("@/services/api");

// Mock du composant PropertyCard : on simplifie son rendu pour le test
jest.mock("@/components/Property/PropertyCard", () => {
  return function MockPropertyCard({
    property,
  }: {
    property: { title: string };
  }) {
    return <div>{property.title}</div>;
  };
});

const mockedApi = api as jest.Mocked<typeof api>;

describe("FavoritesClient", () => {
  // Simule un utilisateur connecté avant chaque test
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1 })
    );
  });
  // Nettoie les mocks et le localStorage après chaque test
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  // Teste l'affichage des favoris récupérés depuis l'API
  it("affiche les favoris", async () => {
    mockedApi.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Villa Luxe",
        },
      ],
    } as any);

    render(<FavoritesClient />);

    // État de chargement affiché en premier
    expect(
      screen.getByText("Chargement...")
    ).toBeInTheDocument();

    // Puis les données arrivent
    await waitFor(() => {
      expect(
        screen.getByText("Villa Luxe")
      ).toBeInTheDocument();
    });
  });
  // Teste l'affichage d'un message lorsque la liste des favoris est vide
  it("affiche aucun favori", async () => {
    mockedApi.get.mockResolvedValue({
      data: [],
    } as any);

    render(<FavoritesClient />);
    // État de chargement affiché en premier
    await waitFor(() => {
      expect(
        screen.getByText("Aucun favori")
      ).toBeInTheDocument();
    });
  });

  it("recharge lors de l'événement favorites-changed", async () => {
    // Premier appel : liste vide, second appel : un favori ajouté
    mockedApi.get
      .mockResolvedValueOnce({
        data: [],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            title: "Maison Test",
          },
        ],
      } as any);

    render(<FavoritesClient />);
    // Vérifie que le message "Aucun favori" est affiché initialement
    await waitFor(() => {
      expect(
        screen.getByText("Aucun favori")
      ).toBeInTheDocument();
    });

    // Déclenche l'événement custom qui doit provoquer un rechargement
    window.dispatchEvent(
      new Event("favorites-changed")
    );
    // Vérifie que le favori "Maison Test" est maintenant affiché après le rechargement
    await waitFor(() => {
      expect(
        screen.getByText("Maison Test")
      ).toBeInTheDocument();
    });
  });
});