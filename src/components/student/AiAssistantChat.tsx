
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessageToAi } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface AiAssistantChatProps {
  conversationId: string | null;
  initialMessages: Message[];
}

const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

export function AiAssistantChat({ conversationId, initialMessages }: AiAssistantChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatInput>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: { message: '' },
  });
  const { formState, register, handleSubmit, reset } = form;

  // This effect ensures that if the parent component passes new initialMessages
  // (e.g., by navigating to a different conversation), the state is updated.
  useEffect(() => {
    setMessages(initialMessages);
    setCurrentConversationId(conversationId);
  }, [initialMessages, conversationId]);


  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const onSubmit = async (data: ChatInput) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    const optimisticUserMessage: Message = { id: 'optimistic-user-' + Date.now(), text: data.message, sender: 'user' };
    const optimisticAiMessage: Message = { id: 'optimistic-ai-' + Date.now(), text: '', sender: 'ai' };
    
    setMessages(prev => [...prev, optimisticUserMessage, optimisticAiMessage]);
    reset();

    const result = await sendMessageToAi(currentConversationId, user.uid, data.message);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
      setMessages(prev => prev.slice(0, -2)); // Remove optimistic messages on error
      return;
    }

    if (result.newConversationId && !currentConversationId) {
        setCurrentConversationId(result.newConversationId);
        // Using replace to avoid breaking back navigation
        router.replace(`/student/ai-assistant/${result.newConversationId}`, { scroll: false });
    }

    setMessages(prev => {
        const newMessages = [...prev];
        const aiMessageIndex = newMessages.findIndex(m => m.id === optimisticAiMessage.id);
        if(aiMessageIndex !== -1) {
             newMessages[aiMessageIndex] = { id: result.aiMessageId!, text: result.aiResponse!, sender: 'ai' };
        }
        const userMessageIndex = newMessages.findIndex(m => m.id === optimisticUserMessage.id);
        if(userMessageIndex !== -1) {
            newMessages[userMessageIndex].id = result.userMessageId!;
        }
        return newMessages;
    });

  };
  
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Bot className="h-12 w-12 text-primary"/>
        </div>
        <h2 className="text-2xl font-bold">Ama, your AI Assistant</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
            Ask me anything about managing stress, study tips, or university resources. I'm here to provide instant support. How can I help you today?
        </p>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? <WelcomeScreen /> : messages.map(message => (
            <div
              key={message.id}
              className={cn('flex items-start gap-4', message.sender === 'user' && 'justify-end')}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-9 w-9 border">
                   <AvatarImage src="/placeholder.svg" alt="Ama" data-ai-hint="friendly AI assistant avatar dark skin" />
                   <AvatarFallback>AMA</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'rounded-xl p-3 max-w-[80%]',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none',
                  !message.text && 'flex items-center justify-center'
                )}
              >
                {message.text ? (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </div>
              {message.sender === 'user' && (
                 <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || 'User'} />
                    <AvatarFallback>{user?.fullName?.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative max-w-4xl mx-auto"
        >
          <Textarea
            {...register('message')}
            placeholder="Ask Ama about stress, studies, or anything else..."
            className="pr-20 resize-none"
            rows={2}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(onSubmit)();
                }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
