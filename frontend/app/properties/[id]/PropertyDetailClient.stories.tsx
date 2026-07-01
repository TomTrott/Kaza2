import type { Meta } from "@storybook/nextjs-vite";
import PropertyDetailClient from "./PropertyDetailClient";

const meta: Meta<typeof PropertyDetailClient> = {
  title: "Pages/PropertyDetailClient/Slider",
  component: PropertyDetailClient,
  tags: ["autodocs"],

  parameters: {
    layout: "fullscreen",

    docs: {
      description: {
        component: `
# Slider / Lightbox

Cette Storybook illustre les tests unitaires réalisés sur le **slider (lightbox)** du composant **PropertyDetailClient**.

## Fonctionnement

Après le chargement d'un logement, la galerie est construite avec :

- l'image de couverture en première position ;
- les images supplémentaires ensuite.

Un clic sur une image ouvre une **lightbox** permettant :

- d'afficher l'image en grand ;
- de naviguer avec les boutons précédent / suivant ;
- d'utiliser les flèches du clavier ;
- de fermer la lightbox avec **Échap**, le bouton **Fermer** ou le clic sur le fond.

---

# Correspondance avec les tests unitaires

Les tests sont réalisés avec **Jest** et **React Testing Library**.

## Mock de l'API

Le service API est entièrement mocké :

\`\`\`ts
jest.mock("@/services/api")
\`\`\`

Chaque test fournit ensuite un logement fictif contenant :

- une image de couverture ;
- cinq images supplémentaires.

Aucun appel HTTP réel n'est effectué.

---

## Vérification de la galerie

Les tests vérifient que :

- le cover est placé en première position ;
- seules les quatre premières miniatures sont visibles.

---

## Ouverture de la lightbox

Les tests simulent un clic sur :

- l'image principale ;
- une vignette.

Puis vérifient que le compteur affiche la bonne position :

- **1 / 6**
- **3 / 6**
- etc.

---

## Navigation

Les tests contrôlent :

- le bouton **Image suivante** ;
- le bouton **Image précédente** ;
- le bouclage de la première vers la dernière image ;
- le bouclage de la dernière vers la première.

---

## Navigation clavier

Les tests simulent :

- ArrowRight ;
- ArrowLeft ;
- Escape.

Ils vérifient également que les autres touches sont ignorées.

---

## Fermeture

Les tests vérifient que la lightbox se ferme :

- avec Escape ;
- avec le bouton Fermer ;
- avec un clic sur le fond noir ;

et qu'elle **ne se ferme pas** lorsqu'on clique directement sur l'image.

---

## Cas particulier

Lorsque le logement ne possède qu'une seule image :

- les boutons précédent / suivant disparaissent.

---

## Scroll

Enfin, un test vérifie que :

- le scroll de la page est bloqué pendant l'ouverture de la lightbox ;
- il est restauré après sa fermeture.
`,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {};