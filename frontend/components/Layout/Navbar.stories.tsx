import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NavbarStorybook from "./NavbarStorybook";

const meta: Meta<typeof NavbarStorybook> = {
  title: "Layout/Navbar",
  component: NavbarStorybook,
  tags: ["autodocs"],

  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## Présentation

La **Navbar** est le composant de navigation principal de l'application **Kasa**. Elle permet d'accéder aux différentes pages du site et adapte automatiquement son affichage selon l'état de connexion de l'utilisateur.

## Version Storybook

Cette version est une **simulation** du composant afin de faciliter sa documentation.

Le contrôle **isLoggedIn** disponible dans Storybook permet de changer dynamiquement l'état de la navigation :

- **false** : affichage d'un visiteur non connecté (Accueil et À propos).
- **true** : affichage d'un utilisateur connecté avec les fonctionnalités **Ajouter un logement**, **Favoris**, **Messagerie** et **Déconnexion**.

Aucune authentification réelle ni appel à l'API n'est effectué dans cette démonstration.

## Fonctionnement dans l'application

Dans l'application Next.js, la Navbar ne repose pas sur la propriété **isLoggedIn**.

Au chargement du composant, un **useEffect** vérifie la présence d'un **token** et des informations de l'utilisateur enregistrés dans le **localStorage**.

- Si aucun utilisateur ou token n'est trouvé, la navigation affiche uniquement les liens accessibles aux visiteurs.
- Si un utilisateur est trouvé, ses informations sont chargées et la Navbar affiche les fonctionnalités réservées aux utilisateurs connectés.

La Navbar effectue également un appel à l'API afin de récupérer le nombre de logements enregistrés dans les favoris de l'utilisateur. Ce nombre est affiché à côté de l'icône **Favoris**.

Enfin, le composant écoute les événements personnalisés **auth-changed** et **favorites-changed**. Lorsqu'un utilisateur se connecte, se déconnecte ou modifie ses favoris, la Navbar est automatiquement mise à jour sans nécessiter de rechargement de la page.
`,
      },
    },
  },

  argTypes: {
    isLoggedIn: {
      control: "boolean",
      description: "Simule l'état de connexion de l'utilisateur.",
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    isLoggedIn: false,
  },
};