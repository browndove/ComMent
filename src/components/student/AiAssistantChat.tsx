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
  message: z.string().min(1, 'Message cannot be empty.').max(1000, 'Message too long.'),
});
type ChatInput = z.infer<typeof ChatInputSchema>;

export function AiAssistantChat({ conversationId, initialMessages }: AiAssistantChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChatInput>({
    resolver: zodResolver(ChatInputSchema),
    defaultValues: { message: '' },
  });
  const { formState, register, handleSubmit, reset, watch } = form;

  // Watch the message input to handle empty state
  const messageValue = watch('message');

  // This effect ensures that if the parent component passes new initialMessages
  // (e.g., by navigating to a different conversation), the state is updated.
  useEffect(() => {
    setMessages(initialMessages);
    setCurrentConversationId(conversationId);
  }, [initialMessages, conversationId]);

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = async (data: ChatInput) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);
    const optimisticUserMessage: Message = { 
      id: 'optimistic-user-' + Date.now(), 
      text: data.message, 
      sender: 'user' 
    };
    const optimisticAiMessage: Message = { 
      id: 'optimistic-ai-' + Date.now(), 
      text: '', 
      sender: 'ai' 
    };
    
    setMessages(prev => [...prev, optimisticUserMessage, optimisticAiMessage]);
    reset();

    try {
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
        if (aiMessageIndex !== -1) {
          newMessages[aiMessageIndex] = { 
            id: result.aiMessageId!, 
            text: result.aiResponse!, 
            sender: 'ai' 
          };
        }
        const userMessageIndex = newMessages.findIndex(m => m.id === optimisticUserMessage.id);
        if (userMessageIndex !== -1) {
          newMessages[userMessageIndex].id = result.userMessageId!;
        }
        return newMessages;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to send message. Please try again.' 
      });
      setMessages(prev => prev.slice(0, -2)); // Remove optimistic messages on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-6">
        <Bot className="h-16 w-16 text-primary"/>
      </div>
      <h2 className="text-3xl font-bold mb-2">Meet Ama</h2>
      <p className="text-muted-foreground text-lg mb-6 max-w-md">
        Your personal AI assistant for university life
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Card className="text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Study Support
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Get help with study techniques, time management, and academic planning
            </p>
          </CardContent>
        </Card>
        <Card className="text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Mental Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Find resources for stress management, wellness tips, and emotional support
            </p>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground mt-6">
        Start by typing your question below 👇
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
                <Avatar className="h-9 w-9 border bg-gradient-to-br from-primary/10 to-primary/5">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'rounded-xl p-4 max-w-[80%] shadow-sm',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none',
                  !message.text && 'flex items-center justify-center min-h-[60px]'
                )}
              >
                {message.text ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Ama is thinking...</span>
                  </div>
                )}
              </div>
              {message.sender === 'user' && (
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={user?.avatarUrl} alt={user?.fullName || 'User'} />
                  <AvatarFallback className="bg-primary/10">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
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
            className="pr-20 resize-none min-h-[60px]"
            rows={2}
            disabled={isLoading}
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
            disabled={isLoading || !messageValue?.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        
        {formState.errors.message && (
          <p className="text-sm text-destructive mt-2 max-w-4xl mx-auto">
            {formState.errors.message.message}
          </p>
        )}
      </div>
    </div>
  );
}