import type { Metadata } from "next";
import ChatClient from "@/components/pages/chat/ChatClient";

export const metadata: Metadata = {
  title: "Messagerie | Kasa",
  description: "Envoyez des messages aux propriétaires et aux locataires de Kasa. Restez en contact avec vos contacts et gérez vos conversations facilement.",
};

export default function ChatPage() {
  return <ChatClient />;
}