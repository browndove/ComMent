import { AiAssistantChat } from "@/components/student/AiAssistantChat";
import { getConversationMessages } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

// This handles both new chats and existing conversations
export default async function ConversationPage({ 
  params 
}: { 
  params: { conversationId?: string } // Make it optional to handle new chats
}) {
  const conversationId = params?.conversationId || null;
  let initialMessages: Message[] = [];
  let error: string | null = null;
  
  // Only try to fetch messages if we have a conversationId
  if (conversationId && conversationId !== 'new') {
    try {
      // Note: You'll need to modify getConversationMessages to work without requiring 
      // a user ID on the server, or implement proper server-side auth
      const result = await getConversationMessages(conversationId);
      if (result.error) {
        error = result.error;
      } else {
        initialMessages = result.messages || [];
      }
    } catch(e: any) {
      console.error('Error fetching conversation messages:', e);
      error = e.message || "An unexpected error occurred while fetching messages.";
    }
  }

  // For new chats or if conversationId is null, initialMessages stays empty array
  // This will trigger the welcome screen

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-semibold">Error Loading Chat</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <AiAssistantChat 
      conversationId={conversationId} 
      initialMessages={initialMessages} 
    />
  );
}