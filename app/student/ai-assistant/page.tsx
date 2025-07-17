import { AiAssistantChat } from "@/components/student/AiAssistantChat";
import { Bot, MessageSquare } from "lucide-react";

export default function AiAssistantPage() {
  // This page now renders the chat component for a new conversation
  return (
    <AiAssistantChat conversationId={null} initialMessages={[]} />
  );
}
