import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PropertyCardStorybook from "./PropertyCardStorybook";

const meta: Meta<typeof PropertyCardStorybook> = {
  title: "Property/PropertyCard",
  component: PropertyCardStorybook,
  tags: ["autodocs"],

  parameters: {
    docs: {
  description: {
    component: `
La **PropertyCard** représente un logement dans la liste des résultats de l'application Kasa.

## Fonctionnement dans l'application

Le composant ne possède aucune donnée en interne. Toutes les informations sont transmises par le composant parent (**HomeClient**) via une propriété (prop) nommée **property**.

Le composant **HomeClient** récupère la liste complète des logements grâce à la requête :

\`GET /api/properties\`

Une fois la réponse reçue, les logements sont enregistrés dans le state React :

\`\`\`ts
setProperties(res.data);
\`\`\`

Le state **properties** contient alors un tableau d'objets ayant la structure suivante :

\`\`\`ts
{
  id,
  title,
  cover,
  location,
  price_per_night
}
\`\`\`

Chaque objet est ensuite parcouru grâce à la méthode **map()** :

\`\`\`tsx
properties.map((property) => (
  <PropertyCard
    key={property.id}
    property={property}
  />
))
\`\`\`

À chaque itération, un nouvel objet **property** est transmis au composant.

Dans **PropertyCard**, les données sont ensuite affichées dynamiquement grâce aux expressions JSX entourées d'accolades :

- \`{property.title}\` → affiche le titre du logement.
- \`{property.location}\` → affiche la ville.
- \`{property.price_per_night}\` → affiche le prix par nuit.
- \`src={coverUrl}\` → affiche l'image du logement.
- \`href={\`/properties/\${property.id}\`}\` → construit automatiquement le lien vers la fiche du logement.

Chaque carte est donc générée automatiquement à partir des données reçues sans qu'il soit nécessaire de créer une carte manuellement.

## Gestion des favoris

Au montage du composant, un **useEffect()** vérifie si un utilisateur est connecté.

Si un utilisateur est présent dans le **localStorage**, une requête est envoyée afin de récupérer ses favoris :

\`\`\`
GET /api/users/{id}/favorites
\`\`\`

Le résultat permet de déterminer si le logement courant appartient déjà aux favoris.

Le clic sur l'icône ❤️ déclenche ensuite une requête :

- **POST** → ajout aux favoris.
- **DELETE** → suppression des favoris.

L'état React **favorite** est alors mis à jour afin de modifier immédiatement l'apparence du bouton.

## Version Storybook

Pour Storybook, une version **PropertyCardStorybook** a été créée.

Aucun appel API n'est effectué. Les données sont directement définies dans les **args** de la story puis transmises au composant comme si elles provenaient de l'API.

Cette approche permet de documenter uniquement l'interface graphique tout en reproduisant fidèlement le rendu de l'application.
A noter que dans la vraie Home la largeur est gérée par la grille (grid), pas par la carte elle-même.
C'est pour cela que la largeur de la carte de la storybook prend toute la largeur disponible (voir vraie rendu dans Home).
`,
  },
},
  },

  argTypes: {
    property: {
      control: false,
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NonFavorite: Story = {
  args: {
    property: {
      id: "1",
      title: "Villa avec piscine",
      location: "Nice",
      price: 180,
      cover: "https://picsum.photos/400/440?1",
      favorite: false,
    },
  },
};

export const Favorite: Story = {
  args: {
    property: {
      id: "2",
      title: "Appartement moderne",
      location: "Paris",
      price: 120,
      cover: "https://picsum.photos/400/440?2",
      favorite: true,
    },
  },
};