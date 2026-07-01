import type { Meta, StoryObj } from "@storybook/react";
import ChatClientStory from "./chatclientstory";

const meta: Meta<typeof ChatClientStory> = {
  title: "Pages/ChatClientStory",
  component: ChatClientStory,
  // La page occupe tout l'écran, pas besoin du padding par défaut de Storybook
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Version **statique** de la page de messagerie (sans \`useRouter\`/\`useSearchParams\`,
sans client API réel, sans \`localStorage\`), utilisée pour le rendu dans Storybook.
Les conversations et messages sont des données en mémoire ; l'envoi d'un message est
simulé par un court délai puis un ajout local, sans aucune requête réseau.

### Frontend en production

- **Auth** — \`services/api.ts\` est une instance axios (\`baseURL: http://localhost:3001\`)
  dont l'intercepteur de requête lit \`localStorage.token\` et ajoute automatiquement
  \`Authorization: Bearer <token>\` à chaque appel. La page vérifie aussi \`localStorage.user\`
  au montage et redirige vers \`/login\` si absent (simple confort d'UX ; la vraie
  protection est côté serveur, voir plus bas).
- **Chargement** — \`GET /api/conversations\` puis, à la sélection d'une conversation,
  \`GET /api/conversations/:id/messages\`.
- **Envoi** — \`POST /api/conversations/:id/messages\` avec \`{ content }\`.
- **Pré-sélection** — le paramètre d'URL \`?conv=ID\` sélectionne automatiquement une
  conversation au chargement (ex: lien "Contacter l'hôte" depuis une fiche logement).

### Backend (Express + SQL)

Le backend est fait main, organisé en 3 couches : **routes → contrôleur → service**.

**1. Routes** (\`routes/api.js\`) — toutes les routes \`/api/*\` passent par le middleware
\`dbReady\` (s'assure que la base est prête) avant d'atteindre un handler. Les routes de
messagerie n'utilisent que \`requireAuth\` (contrairement à \`properties\`/\`users\` qui
utilisent en plus \`requireRole\`/\`requireAdmin\`/\`requireSelfOrAdmin\`), parce que le
vrai contrôle d'accès — "suis-je bien participant de cette conversation ?" — est fait
plus bas, dans le service :

| Méthode | Route | Contrôleur | Rôle |
|---|---|---|---|
| GET | \`/conversations\` | \`messages.list\` | Liste mes conversations |
| POST | \`/conversations\` | \`messages.getOrCreate\` | Récupère/crée une conversation, sans envoyer de message |
| POST | \`/conversations/start\` | \`messages.start\` | Crée/récupère une conversation **et** envoie le 1er message en un seul appel |
| GET | \`/conversations/:id/messages\` | \`messages.getConversationMessages\` | Historique + marque comme lus |
| POST | \`/conversations/:id/messages\` | \`messages.send\` | Envoie un message |

**2. Contrôleur** (\`messagesController.js\`) — couche fine entre HTTP et logique métier :
récupère \`req.user.id\` (posé par \`requireAuth\`), valide les paramètres reçus
(\`toValidId\` rejette tout id non entier positif → 400), appelle la fonction de service
correspondante, et traduit les erreurs levées en code HTTP via \`statusFromError\`
(utilise \`error.status\` si présent — 400/403/404 — sinon 500). \`send\` et \`start\`
renvoient 201 (ressource créée), les autres 200.

**3. Service** (\`messagesService.js\`) — où vit la vraie logique + les requêtes SQL :
- \`assertParticipant\` — avant toute lecture/écriture, vérifie que l'utilisateur courant
  est bien \`user1_id\` ou \`user2_id\` de la conversation visée. 404 si la conversation
  n'existe pas, 403 sinon. **C'est la véritable barrière de sécurité**, pas le check
  \`localStorage\` côté front.
- \`getOrCreateConversation\` — valide que les deux ids sont des entiers distincts,
  vérifie que le destinataire existe en base, cherche une conversation existante entre
  les deux utilisateurs (dans n'importe quel ordre des colonnes \`user1_id\`/\`user2_id\`),
  sinon en crée une.
- \`listConversations\` — une seule requête SQL avec des sous-requêtes corrélées : pour
  chaque conversation, récupère le nom/photo de "l'autre" participant, son dernier
  message et la date associée, et le nombre de messages non lus qu'il/elle a envoyés
  (\`read_at IS NULL AND sender_id != moi\`). Trié par activité la plus récente.
- \`getMessages\` — vérifie l'accès via \`assertParticipant\`, marque comme lus
  (\`read_at = CURRENT_TIMESTAMP\`) tous les messages reçus (pas envoyés par moi) puis
  renvoie l'historique complet, du plus ancien au plus récent, avec le nom/photo de
  l'expéditeur joints.
- \`sendMessage\` — vérifie l'accès, valide le contenu (chaîne non vide après \`trim\`,
  max \`MAX_MESSAGE_LENGTH = 5000\` caractères → 400 sinon), insère le message, met à
  jour \`updated_at\` de la conversation (utilisé pour le tri dans \`listConversations\`),
  puis renvoie le message créé avec les infos de l'expéditeur jointes.
- \`startConversation\` — simple enchaînement \`getOrCreateConversation\` + \`sendMessage\`,
  exposé pour démarrer une discussion et envoyer le premier message en un seul appel
  (utilisé typiquement par un bouton "Contacter" ailleurs dans l'app).

### Dans cette story

Aucune des règles ci-dessus (auth, participant, validation de longueur...) n'est
appliquée : les props \`currentUser\`, \`conversations\`, \`messagesByConversation\`,
\`initialConversationId\` et \`onBack\` permettent de piloter entièrement l'état affiché,
et \`sendMessage\` se contente d'ajouter le message localement après un court délai
simulé.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onBack: { action: "back" },
  },
};

export default meta;
type Story = StoryObj<typeof ChatClientStory>;

// État par défaut : conversations de démo, aucune sélectionnée
export const Default: Story = {
  args: {
    onBack: () => console.log("[Storybook] Retour cliqué"),
  },
};

// Une conversation est présélectionnée au montage, comme avec ?conv=ID en prod
export const ConversationPreselectionnee: Story = {
  args: {
    ...Default.args,
    initialConversationId: 1,
  },
};

// Conversation avec des messages non lus, pour visualiser le badge rouge dans la liste
export const AvecMessagesNonLus: Story = {
  args: {
    ...Default.args,
    initialConversationId: 2,
  },
};

// Aucune conversation du tout — état vide de la sidebar
export const SansConversation: Story = {
  args: {
    ...Default.args,
    conversations: [],
    messagesByConversation: {},
  },
};

// Délai de chargement allongé pour observer le skeleton plus longtemps
export const Chargement: Story = {
  args: {
    ...Default.args,
    simulatedLoadDelayMs: 4000,
  },
};