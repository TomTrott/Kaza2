import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import RegisterPageStorybook from "./RegisterStorybook";

const meta: Meta<typeof RegisterPageStorybook> = {
  title: "Pages/Register",
  component: RegisterPageStorybook,
  tags: ["autodocs"],

  parameters: {
    layout: "fullscreen",

    docs: {
      description: {
        component: `
La **page d'inscription** permet à un nouvel utilisateur de créer un compte sur l'application Kasa.

## Fonctionnement dans l'application

Le formulaire comporte plusieurs champs :

- Nom ;
- Prénom ;
- Adresse email ;
- Mot de passe ;
- Acceptation des conditions générales d'utilisation.

Chaque champ est associé à un **state React** grâce à **useState()**. Les valeurs sont mises à jour automatiquement au fur et à mesure de la saisie.

Avant d'envoyer les informations à l'API, le formulaire vérifie que la case des conditions générales est cochée.

Si ce n'est pas le cas, l'inscription est interrompue.

Lorsque le formulaire est valide, une requête HTTP est envoyée :

\`\`\`
POST /auth/register
\`\`\`

avec les informations suivantes :

\`\`\`json
{
  "name": "Prénom Nom",
  "email": "...",
  "password": "..."
}
\`\`\`

Le prénom et le nom sont concaténés afin de former la propriété **name** envoyée à l'API.

Après la création du compte, l'API retourne :

- un **token JWT** ;
- les informations du nouvel utilisateur.

Ces informations sont enregistrées dans le **localStorage** afin que l'utilisateur soit immédiatement connecté.

L'événement :

\`\`\`
auth-changed
\`\`\`

est ensuite émis afin de prévenir les autres composants de l'application.

Enfin, **useRouter()** redirige automatiquement le nouvel utilisateur vers la page d'accueil.

En cas d'erreur (email déjà utilisé, données invalides...), le message renvoyé par l'API est affiché.

## Version Storybook

Pour Storybook, une version **RegisterPageStorybook** est utilisée.

Le formulaire est entièrement statique :

- aucune validation serveur ;
- aucun appel API ;
- aucune création de compte ;
- aucune écriture dans le localStorage ;
- aucune redirection.

Cette version reproduit uniquement l'apparence de la page afin de documenter son interface indépendamment du backend.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};