import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import FavoritesClient from "./FavoritesClient";
import api from "@/services/api";

const meta: Meta<typeof FavoritesClient> = {
    title: "Pages/FavoritesClient",
    component: FavoritesClient,
    tags: ["autodocs"],

    parameters: {
        layout: "fullscreen",

        docs: {
            description: {
                component: `
Le composant **FavoritesClient** affiche les logements enregistrés en favoris par l'utilisateur connecté.

# Fonctionnement du composant

Au montage, le composant :

1. récupère l'utilisateur connecté dans le **localStorage** ;
2. effectue un appel :

\`\`\`
GET /api/favorites
\`\`\`

Selon la réponse de l'API, trois états sont possibles :

- **Chargement** : affichage du texte *"Chargement..."* ;
- **Favoris trouvés** : affichage d'une **PropertyCard** pour chaque logement ;
- **Aucun favori** : affichage du message *"Aucun favori"*.

Le composant écoute également l'événement personnalisé **favorites-changed** sur \`window\`.
Lorsque cet événement est déclenché, un nouvel appel API est effectué afin de recharger automatiquement la liste des favoris.

---

# Correspondance avec les tests unitaires

Cette Storybook reproduit exactement les scénarios testés avec **Jest** et **React Testing Library**.

Les tests unitaires utilisent plusieurs **mocks** afin d'isoler complètement le composant.

## 1. Mock du service API

Le service :

\`\`\`ts
@/services/api
\`\`\`

est mocké avec :

\`\`\`ts
jest.mock("@/services/api");
\`\`\`

Aucun appel HTTP réel n'est effectué.

Chaque test fournit ensuite une réponse différente grâce à :

\`\`\`ts
mockedApi.get.mockResolvedValue(...)
\`\`\`

ou

\`\`\`ts
mockResolvedValueOnce(...)
\`\`\`

pour simuler plusieurs appels successifs.

---

## 2. Mock du composant PropertyCard

Le composant **PropertyCard** est remplacé par une version très simple :

\`\`\`tsx
<div>{property.title}</div>
\`\`\`

L'objectif est de tester uniquement le comportement de **FavoritesClient**, sans dépendre du rendu réel de PropertyCard.

---

## 3. Simulation d'un utilisateur connecté

Avant chaque test, un utilisateur est enregistré dans le **localStorage** :

\`\`\`ts
localStorage.setItem(
  "user",
  JSON.stringify({ id: 1 })
);
\`\`\`

Le composant se comporte ainsi comme si un utilisateur était authentifié.

---

## 4. Vérification de l'état de chargement

Après le rendu :

\`\`\`ts
render(<FavoritesClient />);
\`\`\`

le test vérifie d'abord que le composant affiche :

- **"Chargement..."**

avant l'arrivée des données.

---

## 5. Vérification des favoris

Lorsque l'API renvoie :

\`\`\`ts
[
  {
    id: 1,
    title: "Villa Luxe"
  }
]
\`\`\`

le test attend la mise à jour du DOM avec :

\`\`\`ts
await waitFor(() => {
  expect(
    screen.getByText("Villa Luxe")
  ).toBeInTheDocument();
});
\`\`\`

---

## 6. Vérification de la liste vide

Lorsque l'API renvoie :

\`\`\`ts
[]
\`\`\`

le test vérifie que le composant affiche :

- **"Aucun favori"**

---

## 7. Vérification du rechargement automatique

Le dernier test simule deux réponses successives :

Premier appel :

\`\`\`ts
[]
\`\`\`

Deuxième appel :

\`\`\`ts
[
  {
    id: 1,
    title: "Maison Test"
  }
]
\`\`\`

Puis il déclenche l'événement :

\`\`\`ts
window.dispatchEvent(
  new Event("favorites-changed")
);
\`\`\`

Le test vérifie alors que le composant recharge les données et affiche :

- **Maison Test**

---

# Correspondance Storybook

Les trois stories ci-dessous reprennent exactement ces scénarios :

- **AvecFavoris** → test *"affiche les favoris"* ;
- **AucunFavori** → test *"affiche aucun favori"* ;
- **RechargementApresEvenement** → test *"recharge lors de l'événement favorites-changed"*.

Chaque story remplace également **api.get** par une fonction simulée afin de reproduire le comportement testé sans effectuer d'appel réseau réel.
`,
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Simule un utilisateur connecté dans le localStorage avant chaque story
const withLoggedUser = () => {
    localStorage.setItem("user", JSON.stringify({ id: 1 }));
};

// Scénario 1 : affiche les favoris
export const AvecFavoris: Story = {
    loaders: [
        async () => {
            withLoggedUser();
            api.get = (async () => ({
                data: [{ id: 1, title: "Villa Luxe" }],
            })) as typeof api.get;
            return {};
        },
    ],
};

// Scénario 2 : aucun favori
export const AucunFavori: Story = {
    loaders: [
        async () => {
            withLoggedUser();
            api.get = (async () => ({
                data: [],
            })) as typeof api.get;
            return {};
        },
    ],
};

// Scénario 3 : rechargement lors de l'événement favorites-changed
export const RechargementApresEvenement: Story = {
    loaders: [
        async () => {
            withLoggedUser();
            let callCount = 0;
            api.get = (async () => {
                callCount++;
                if (callCount === 1) {
                    return { data: [] };
                }
                return { data: [{ id: 1, title: "Maison Test" }] };
            }) as typeof api.get;
            return {};
        },
    ],
    play: async () => {
        // Déclenche l'événement custom après le premier rendu ("Aucun favori")
        window.dispatchEvent(new Event("favorites-changed"));
    },
};