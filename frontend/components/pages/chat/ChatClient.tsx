"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { fullUrl } from "@/lib/url";
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

export default function ChatClient() {
  // Hooks de navigation et de récupération des paramètres de recherche
  const router = useRouter();
  const searchParams = useSearchParams();
  // États locaux pour gérer l'utilisateur, les conversations, les messages et l'état de chargement
  const [user, setUser] = useState<User | null>(null);
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
  // Effet pour vérifier si l'utilisateur est connecté et le rediriger vers la page de connexion si nécessaire
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    // On essaie de parser l'utilisateur stocké, et on gère les erreurs si le JSON est invalide
    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Utilisateur stocké invalide", e);
      router.push("/login");
    }
  }, []);
  // Fonction pour charger les conversations depuis l'API
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.get("/api/conversations");
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);
  // Effet pour charger les conversations lorsque l'utilisateur est défini
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user, loadConversations]);
  // Effet pour faire défiler automatiquement vers le bas de la liste des messages lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // Fonction pour sélectionner une conversation et charger ses messages depuis l'API
  const selectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConv(conv);
    setMobileView("detail");
    // On charge les messages de la conversation sélectionnée
    try {
      const res = await api.get(`/api/conversations/${conv.id}/messages`);
      setMessages(res.data);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-sélectionne la conv depuis l'URL ?conv=ID
  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (conversations.length === 0) return;

    const convParam = searchParams.get("conv");
    if (!convParam) return;
    // On cherche la conversation correspondant à l'ID dans les paramètres de recherche
    const target = conversations.find((c) => c.id === Number(convParam));
    if (target) {
      autoSelectedRef.current = true;
      selectConversation(target);
    }
  }, [conversations, searchParams, selectConversation]);

  const backToList = () => {
    setMobileView("list");
  };
  // Fonction pour envoyer un message via l'API et mettre à jour l'état local
  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !selectedConv || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/api/conversations/${selectedConv.id}/messages`, {
        content,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      console.error(e);
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
            onClick={() => router.back()}
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