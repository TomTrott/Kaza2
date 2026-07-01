import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoginPageStorybook from "./LoginStorybook";

const meta: Meta<typeof LoginPageStorybook> = {
  title: "Pages/Login",
  component: LoginPageStorybook,
  tags: ["autodocs"],

  parameters: {
    layout: "fullscreen",

    docs: {
      description: {
        component: `
La **page de connexion** permet à un utilisateur existant de s'authentifier afin d'accéder à son espace personnel.

## Fonctionnement dans l'application

La page est composée d'un formulaire contenant deux champs :

- **Adresse email**
- **Mot de passe**

Les valeurs saisies sont enregistrées dynamiquement dans deux states React grâce à **useState()**.

Lors du clic sur **Se connecter**, la fonction **handleLogin()** est exécutée.

Le comportement par défaut du formulaire est d'abord annulé grâce à :

\`\`\`ts
e.preventDefault();
\`\`\`

Une requête HTTP est ensuite envoyée à l'API :

\`\`\`
POST /auth/login
\`\`\`

avec les informations suivantes :

\`\`\`json
{
  "email": "...",
  "password": "..."
}
\`\`\`

Si les identifiants sont corrects, l'API retourne :

- un **token JWT** ;
- les informations de l'utilisateur connecté.

Ces données sont enregistrées dans le **localStorage** :

- \`token\`
- \`user\`

afin que l'utilisateur reste connecté même après un rafraîchissement de la page.

L'événement personnalisé :

\`\`\`
auth-changed
\`\`\`

est ensuite déclenché afin d'informer les autres composants (comme la Navbar) que l'utilisateur est désormais connecté.

Enfin, **useRouter()** redirige automatiquement l'utilisateur vers la page d'accueil :

\`\`\`ts
router.push("/");
\`\`\`

Si les identifiants sont incorrects, une alerte est affichée.

## Version Storybook

Dans Storybook, une version **LoginPageStorybook** est utilisée.

Le formulaire est entièrement statique :

- aucune requête HTTP n'est envoyée ;
- aucun appel à l'API n'est effectué ;
- aucun token n'est enregistré ;
- aucune redirection n'est réalisée.

Cette version permet uniquement de documenter l'interface graphique et la disposition des différents éléments du formulaire.
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};