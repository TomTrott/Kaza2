"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, Send } from "lucide-react";

interface Conversation {
  id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_picture: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender_name: string;
  sender_picture: string | null;
}

interface User {
  id: number;
  [key: string]: unknown;
}

// Formatage de l'heure pour l'affichage dans la liste des messages
function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
// Formatage de la date pour l'affichage du séparateur de date dans la conversation
function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
// Vérifie si deux dates sont le même jour (utile pour afficher le séparateur de date)
function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// En prod, `fullUrl` (lib/url) préfixe les chemins relatifs renvoyés par l'API
// (ex: "/uploads/xxx.webp") avec l'origine de l'API pour obtenir une URL absolue.
// Ici, version statique : on n'a pas d'API, donc on renvoie le chemin tel quel.
function fullUrl(path: string) {
  return path;
}

// --- Données de démonstration (remplacent les appels à /api/conversations, etc.) ---

const defaultCurrentUser: User = { id: 1, name: "Vous" };

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

const defaultConversations: Conversation[] = [
  {
    id: 1,
    other_user_id: 2,
    other_user_name: "Camille Dubois",
    other_user_picture: null,
    last_message: "Parfait, à demain alors !",
    last_message_at: minutesAgo(25),
    unread_count: 0,
  },
  {
    id: 2,
    other_user_id: 3,
    other_user_name: "Hôte · Le Petit Nid",
    other_user_picture: null,
    last_message: "Le logement est disponible aux dates indiquées.",
    last_message_at: minutesAgo(240),
    unread_count: 2,
  },
  {
    id: 3,
    other_user_id: 4,
    other_user_name: "Lucas Martin",
    other_user_picture: null,
    last_message: null,
    last_message_at: null,
    unread_count: 0,
  },
];

const defaultMessagesByConversation: Record<number, Message[]> = {
  1: [
    {
      id: 101,
      sender_id: 2,
      content: "Bonjour ! Le logement est-il libre le week-end du 12 ?",
      created_at: minutesAgo(180),
      sender_name: "Camille Dubois",
      sender_picture: null,
    },
    {
      id: 102,
      sender_id: 1,
      content: "Bonjour Camille, oui c'est disponible sur ces dates !",
      created_at: minutesAgo(120),
      sender_name: "Vous",
      sender_picture: null,
    },
    {
      id: 103,
      sender_id: 2,
      content: "Parfait, à demain alors !",
      created_at: minutesAgo(25),
      sender_name: "Camille Dubois",
      sender_picture: null,
    },
  ],
  2: [
    {
      id: 201,
      sender_id: 3,
      content: "Bonjour, j'ai une question sur la propriété.",
      created_at: minutesAgo(260),
      sender_name: "Hôte · Le Petit Nid",
      sender_picture: null,
    },
    {
      id: 202,
      sender_id: 3,
      content: "Le logement est disponible aux dates indiquées.",
      created_at: minutesAgo(240),
      sender_name: "Hôte · Le Petit Nid",
      sender_picture: null,
    },
  ],
  3: [],
};

export interface ChatClientStoryProps {
  /** Utilisateur "connecté" simulé — sert uniquement à déterminer mes propres messages
   * (`msg.sender_id === user.id`) et le nom affiché lors de l'envoi. */
  currentUser?: User;
  /** Conversations affichées (mock). Par défaut : jeu de données de démonstration. */
  conversations?: Conversation[];
  /** Messages par conversation (mock), indexés par id de conversation. */
  messagesByConversation?: Record<number, Message[]>;
  /** Id de conversation à présélectionner au montage — équivalent du `?conv=ID` en prod. */
  initialConversationId?: number;
  /** Délai (ms) avant d'afficher les conversations, pour simuler un chargement réseau
   * et permettre de démontrer le skeleton de chargement. */
  simulatedLoadDelayMs?: number;
  /** Appelé au clic sur le bouton "Retour" de la sidebar. Sans callback, fallback
   * sur `window.history.back()`. */
  onBack?: () => void;
}

/**
 * Page de messagerie — version statique, sans dépendance à Next.js (`useRouter` /
 * `useSearchParams`), au client API réel, ni à `localStorage`. Toutes les interactions
 * (sélection de conversation, envoi de message, vue mobile liste/détail) fonctionnent
 * côté client sur des données en mémoire. Pensée pour être rendue isolément dans
 * Storybook.
 *
 * ### Fonctionnement en production
 * La page connectée (`ChatClient`) suit le même flux d'interface, mais avec de vraies
 * données et un vrai serveur derrière :
 *
 * 1. **Authentification** — au montage, la page lit `localStorage.user` ; si absent,
 *    elle redirige vers `/login`. Le client API (`services/api.ts`, instance axios sur
 *    `http://localhost:3001`) attache automatiquement un `Authorization: Bearer <token>`
 *    (lu dans `localStorage.token`) à chaque requête via un intercepteur. Le check côté
 *    page n'est qu'une commodité d'UX : la vraie protection est faite côté serveur
 *    (middleware `requireAuth`, voir plus bas).
 *
 * 2. **Chargement des conversations** — `GET /api/conversations` renvoie, pour
 *    l'utilisateur connecté, la liste de ses conversations avec le nom/photo de
 *    "l'autre" participant, le dernier message, sa date, et le nombre de messages non
 *    lus — déjà calculés côté serveur.
 *
 * 3. **Sélection d'une conversation** — `GET /api/conversations/:id/messages` renvoie
 *    l'historique complet (du plus ancien au plus récent) et marque côté serveur les
 *    messages reçus comme lus.
 *
 * 4. **Envoi d'un message** — `POST /api/conversations/:id/messages` avec
 *    `{ content }` ; la réponse (le message créé, avec les infos de l'expéditeur) est
 *    ajoutée à la liste locale et la conversation correspondante est mise à jour
 *    (dernier message + date) sans recharger toute la liste.
 *
 * 5. **Pré-sélection via l'URL** — un paramètre `?conv=ID` dans l'URL permet d'arriver
 *    directement sur une conversation donnée (ex: lien "Contacter l'hôte" depuis une
 *    fiche logement).
 *
 * Le détail du backend (routes, contrôleur, logique métier/SQL) est documenté dans la
 * description du fichier `.stories.tsx`, puisque c'est lui qui sert de doc de référence
 * pour ce module.
 */
export default function ChatClientStory({
  currentUser = defaultCurrentUser,
  conversations: initialConversations = defaultConversations,
  messagesByConversation = defaultMessagesByConversation,
  initialConversationId,
  simulatedLoadDelayMs = 500,
  onBack,
}: ChatClientStoryProps) {
  const user = currentUser;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // Sur mobile, contrôle quelle vue est affichée : la liste ou le détail d'une conversation
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSelectedRef = useRef(false);

  // Simule le chargement réseau de "GET /api/conversations"
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setConversations(initialConversations);
      setLoading(false);
    }, simulatedLoadDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [initialConversations, simulatedLoadDelayMs]);

  // Défile automatiquement vers le bas de la liste des messages lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sélectionne une conversation et charge ses messages (mock = lookup local au lieu d'un GET)
  const selectConversation = useCallback(
    (conv: Conversation) => {
      setSelectedConv(conv);
      setMobileView("detail");
      const convMessages = messagesByConversation[conv.id] ?? [];
      setMessages(convMessages);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    },
    [messagesByConversation]
  );

  // Auto-sélectionne la conv depuis `initialConversationId` (équivalent ?conv=ID en prod)
  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (conversations.length === 0) return;
    if (initialConversationId == null) return;

    const target = conversations.find((c) => c.id === initialConversationId);
    if (target) {
      autoSelectedRef.current = true;
      selectConversation(target);
    }
  }, [conversations, initialConversationId, selectConversation]);

  const backToList = () => {
    setMobileView("list");
  };

  // Retour (sidebar) : callback fourni par le parent (Storybook, page hôte...) ou fallback navigateur
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  }, [onBack]);

  // Envoie un message — version statique : aucun appel réseau réel
  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !selectedConv || sending) return;

    setSending(true);
    try {
      // Simule l'aller-retour réseau d'un vrai POST /api/conversations/:id/messages
      await new Promise((resolve) => setTimeout(resolve, 300));

      const fakeMessage: Message = {
        id: Date.now(),
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        sender_name: typeof user.name === "string" ? user.name : "Vous",
        sender_picture: null,
      };

      setMessages((prev) => [...prev, fakeMessage]);
      setNewMessage("");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: content, last_message_at: fakeMessage.created_at }
            : c
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Gestion de l'événement de pression de touche pour envoyer le message avec "Enter"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex h-[calc(100dvh-153px)] md:h-[calc(100dvh-190px)] overflow-hidden">
      {/* ── Sidebar conversations ── */}
      <div
        className={`w-full md:w-[300px] shrink-0 flex flex-col min-h-0 border-r border-gray-100 bg-white ${mobileView === "detail" ? "hidden md:flex" : "flex"
          }`}
      >
        <div className="px-5 pt-6 pb-4 shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 hover:text-gray-800"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Retour
          </button>
          <h1 className="text-2xl font-semibold">Messages</h1>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 px-5">Aucune conversation</p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={selectedConv?.id === conv.id}
                onSelect={() => selectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Zone messages ── */}
      <div
        className={`flex-1 flex flex-col min-h-0 ${mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
      >
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            {/* Bouton retour visible uniquement sur mobile, ramène à la liste des conversations */}
            <div className="md:hidden px-4 pt-4 shrink-0">
              <button
                onClick={backToList}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft size={14} aria-hidden="true" /> Retour
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showDateSep = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at);

                return (
                  <div key={msg.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">{formatDateSeparator(msg.created_at)}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                      <div className="w-9 h-9 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                        {msg.sender_picture ? (
                          <img
                            src={fullUrl(msg.sender_picture)}
                            alt=""
                            width={36}
                            height={36}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300" />
                        )}
                      </div>

                      <div
                        className={`max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
                      >
                        <div
                          className={`flex items-center gap-2 text-xs text-gray-400 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          <span className="font-medium text-gray-600">{msg.sender_name}</span>
                          <span>•</span>
                          <span>{formatTime(msg.created_at)}</span>
                        </div>

                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${isMe
                              ? "bg-[#9F3A1D] text-white rounded-tr-sm"
                              : "bg-white text-gray-800 rounded-tl-sm shadow-sm"
                            }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-100 bg-white px-4 md:px-6 py-4 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-3"
              >
                <label htmlFor="chat-message" className="sr-only">
                  Votre message
                </label>
                <input
                  id="chat-message"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Envoyer un message"
                  disabled={sending}
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9F3A1D]/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  aria-label="Envoyer le message"
                  className="w-10 h-10 rounded-lg bg-[#9F3A1D] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 shrink-0"
                >
                  <Send size={15} aria-hidden="true" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Item de conversation extrait en composant mémoïsé séparé.
 * Évite de recréer les closures / re-render toute la liste
 * à chaque frappe ou changement d'état non lié.
 */
const ConversationItem = ({
  conv,
  isSelected,
  onSelect,
}: {
  conv: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const pictureUrl = conv.other_user_picture && !imgError ? fullUrl(conv.other_user_picture) : null;

  return (
    <button
      onClick={onSelect}
      aria-label={`Conversation avec ${conv.other_user_name}${conv.unread_count > 0 ? `, ${conv.unread_count} message(s) non lu(s)` : ""
        }`}
      className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition text-left border-b border-gray-50 ${isSelected ? "bg-gray-50" : ""
        }`}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
        {pictureUrl ? (
          <img
            src={pictureUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">{conv.other_user_name}</span>
          {conv.last_message_at && (
            <span className="text-[11px] text-gray-400 shrink-0 ml-2">
              {formatTime(conv.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-400 truncate max-w-[160px]">
            {conv.last_message || "Aucun message"}
          </p>
          {conv.unread_count > 0 && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-2" />}
        </div>
      </div>
    </button>
  );
};

/**
 remplace le "Chargement..." brut et réserve l'espace pour éviter le CLS au moment du switch.
 */
function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-153px)] md:h-[calc(100dvh-190px)] overflow-hidden animate-pulse">
      <div className="w-full md:w-[300px] shrink-0 flex flex-col min-h-0 border-r border-gray-100 bg-white">
        <div className="px-5 pt-6 pb-4 shrink-0">
          <div className="h-4 w-16 bg-gray-200 rounded mb-5" />
          <div className="h-7 w-32 bg-gray-200 rounded" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-300 text-sm">
        Chargement des conversations…
      </div>
    </div>
  );
}