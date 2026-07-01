import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HomeStorybook from "./HomeStorybook";

const meta: Meta<typeof HomeStorybook> = {
  title: "Pages/Home",
  component: HomeStorybook,
  tags: ["autodocs"],

  parameters: {
    layout: "fullscreen",

    docs: {
      description: {
        component: `
La **page Accueil** est la page principale de l'application Kasa. Elle permet aux utilisateurs de consulter les logements disponibles dès leur arrivée sur le site.

## Fonctionnement dans l'application

Lors du chargement de la page, le composant **HomeClient** effectue une requête HTTP vers l'API :

\`\`\`
GET /api/properties
\`\`\`

Cette requête retourne un tableau contenant tous les logements enregistrés dans la base de données.

Chaque objet possède notamment les propriétés suivantes :

- **id** : identifiant unique du logement ;
- **title** : nom du logement ;
- **cover** : image principale ;
- **location** : ville ou localisation ;
- **price_per_night** : prix d'une nuit.

Une fois la réponse reçue, les données sont enregistrées dans le state React :

\`\`\`ts
setProperties(res.data);
\`\`\`

Le state **properties** contient alors la liste complète des logements.

Avant l'affichage, le composant détermine automatiquement combien de cartes doivent être affichées en fonction de la largeur de la fenêtre :

- moins de 768 px → **6 logements** ;
- à partir de 768 px → **12 logements**.

Cette valeur est stockée dans le state **limit** puis mise à jour automatiquement lorsqu'un redimensionnement de la fenêtre est détecté grâce à un **useEffect**.

Les logements sont ensuite parcourus grâce à la méthode :

\`\`\`tsx
properties.slice(0, limit).map((property) => (
  <PropertyCard
    key={property.id}
    property={property}
  />
))
\`\`\`

La méthode **slice()** limite le nombre de logements affichés tandis que **map()** crée une nouvelle **PropertyCard** pour chaque objet présent dans le tableau.

Chaque carte reçoit alors un objet **property** contenant toutes les informations nécessaires à son affichage (titre, image, localisation, prix...).

Les cartes sont enfin organisées automatiquement grâce à une grille CSS responsive :

- **1 colonne** sur mobile ;
- **2 colonnes** sur tablette ;
- **3 colonnes** sur les grands écrans.

## Version Storybook

Storybook n'a pas vocation à communiquer avec l'API de l'application. Une version dédiée nommée **HomeStorybook** a donc été créée.

Dans cette version :

- aucune requête HTTP n'est exécutée ;
- aucun state React n'est utilisé pour charger les logements ;
- les données sont remplacées par un tableau d'objets statiques directement déclaré dans le composant.

Chaque objet est ensuite parcouru exactement comme dans l'application réelle afin d'afficher une **PropertyCardStorybook**.

Cette approche reproduit fidèlement le comportement visuel de la page tout en supprimant les dépendances liées :

- à l'API ;
- à la base de données ;
- au réseau ;
- à l'authentification.

Le rendu obtenu est ainsi totalement stable, reproductible et parfaitement adapté à la documentation des composants.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};